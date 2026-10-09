"""Testes dos bloqueios de segurança dos scripts de release, sem rede ou Docker real."""

import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def executable(path: Path, content: str) -> None:
    path.write_text(content)
    path.chmod(0o755)


class DeployScriptTest(unittest.TestCase):
    def run_script(self, *args: str, **overrides: str):
        with tempfile.TemporaryDirectory() as directory:
            workdir = Path(directory)
            bin_dir = workdir / "bin"
            bin_dir.mkdir()
            shutil.copy2(ROOT / "deploy.sh", workdir / "deploy.sh")
            events = workdir / "events"
            rsync_log = workdir / "rsync-args"
            executable(
                workdir / "smoke_test.sh",
                '#!/bin/sh\necho smoke >> "$CALL_LOG"\nexit "${MOCK_SMOKE_STATUS:-0}"\n',
            )
            executable(
                bin_dir / "ssh",
                """#!/bin/sh
case "$*" in
  *backup_postgres.sh*) echo backup >> "$CALL_LOG"; exit "${MOCK_BACKUP_STATUS:-0}" ;;
  *) echo remote_deploy >> "$CALL_LOG"; exit "${MOCK_REMOTE_STATUS:-0}" ;;
esac
""",
            )
            executable(
                bin_dir / "rsync",
                """#!/bin/sh
echo "$*" >> "$MOCK_RSYNC_LOG"
case " $* " in
  *' --dry-run '*)
    echo dry_run >> "$CALL_LOG"
    if [ "${MOCK_DELETION:-0}" = 1 ]; then echo 'deleting unexpected-file'; fi
    exit "${MOCK_DRY_RUN_STATUS:-0}" ;;
  *) echo transfer >> "$CALL_LOG"; exit "${MOCK_TRANSFER_STATUS:-0}" ;;
esac
""",
            )
            executable(
                bin_dir / "docker",
                '#!/bin/sh\necho docker >> "$CALL_LOG"\nexit "${MOCK_DOCKER_STATUS:-0}"\n',
            )
            executable(bin_dir / "service", '#!/bin/sh\nexit 0\n')
            executable(bin_dir / "sudo", '#!/bin/sh\necho sudo >> "$CALL_LOG"\nexit 0\n')
            env = os.environ.copy()
            env.update({
                "PATH": f"{bin_dir}:{env['PATH']}",
                "CALL_LOG": str(events),
                "MOCK_RSYNC_LOG": str(rsync_log),
            })
            env.update(overrides)
            result = subprocess.run(
                ["bash", "./deploy.sh", *args], cwd=workdir, env=env,
                capture_output=True, text=True, timeout=10,
            )
            result.rsync_calls = rsync_log.read_text().splitlines() if rsync_log.exists() else []
            return result, events.read_text().splitlines() if events.exists() else []

    def test_smoke_failure_blocks_all_remote_actions(self):
        result, events = self.run_script("remote", MOCK_SMOKE_STATUS="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke"])

    def test_backup_failure_blocks_transfer(self):
        result, events = self.run_script("remote", MOCK_BACKUP_STATUS="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "backup"])

    def test_dry_run_failure_blocks_transfer(self):
        result, events = self.run_script("remote", MOCK_DRY_RUN_STATUS="23")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "backup", "dry_run"])

    def test_dry_run_deletion_blocks_transfer_without_printing_filename(self):
        result, events = self.run_script("remote", MOCK_DELETION="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "backup", "dry_run"])
        self.assertNotIn("unexpected-file", result.stdout + result.stderr)

    def test_remote_deploy_failure_is_reported(self):
        result, events = self.run_script("remote", MOCK_REMOTE_STATUS="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "backup", "dry_run", "transfer", "remote_deploy"])

    def test_dry_run_and_transfer_use_checksums(self):
        result, events = self.run_script("remote")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "backup", "dry_run", "transfer", "remote_deploy"])
        self.assertEqual(len(result.rsync_calls), 2)
        self.assertTrue(all("--checksum" in call for call in result.rsync_calls))

    def test_local_docker_failure_is_reported(self):
        result, events = self.run_script(MOCK_DOCKER_STATUS="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("docker", events)

    def test_local_deploy_does_not_stop_host_database(self):
        result, events = self.run_script()
        self.assertEqual(result.returncode, 0)
        self.assertNotIn("sudo", events)


class SmokeScriptTest(unittest.TestCase):
    def run_script(self, maven_status: int = 0, source: str = ""):
        with tempfile.TemporaryDirectory() as directory:
            workdir = Path(directory)
            bin_dir = workdir / "bin"
            bin_dir.mkdir()
            shutil.copy2(ROOT / "smoke_test.sh", workdir / "smoke_test.sh")
            (workdir / ".env").write_text("JWT_SECRET=placeholder\nSTRIPE_WEBHOOK_SECRET=placeholder\n")
            (workdir / "CLAUDE.md").touch()
            (workdir / "ROADMAP.md").touch()
            (workdir / "sistema" / "src").mkdir(parents=True)
            (workdir / "sistema" / "src" / "sample.txt").write_text(source)
            (workdir / "frontend").mkdir()
            (workdir / "frontend" / "package.json").touch()
            executable(
                workdir / "sistema" / "mvnw",
                '#!/bin/sh\necho simulated-maven-result\nexit "${MOCK_MAVEN_STATUS:-0}"\n',
            )
            executable(
                bin_dir / "docker",
                '#!/bin/sh\nif [ "$1" = --version ]; then echo "Docker version 28.0.0"; fi\nexit 0\n',
            )
            npm_log = workdir / "npm-calls"
            executable(
                bin_dir / "npm",
                '#!/bin/sh\necho "$*" >> "$MOCK_NPM_LOG"\nexit 0\n',
            )
            env = os.environ.copy()
            env.update({
                "PATH": f"{bin_dir}:{env['PATH']}",
                "MOCK_MAVEN_STATUS": str(maven_status),
                "MOCK_NPM_LOG": str(npm_log),
            })
            result = subprocess.run(
                ["bash", "./smoke_test.sh"], cwd=workdir, env=env,
                capture_output=True, text=True, timeout=10,
            )
            result.npm_calls = npm_log.read_text().splitlines() if npm_log.exists() else []
            return result

    def test_maven_failure_is_not_hidden_by_tail(self):
        result = self.run_script(maven_status=1)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Testes backend FALHARAM", result.stdout)

    def test_hardcoded_secret_is_not_printed(self):
        fake_secret = "sk_" + "live_FAKE_FOR_TEST_ONLY"
        result = self.run_script(source=fake_secret)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn(fake_secret, result.stdout + result.stderr)

    def test_frontend_smoke_includes_lint_and_browser_tests(self):
        result = self.run_script()
        self.assertEqual(result.returncode, 0)
        self.assertTrue(any(call.startswith("run lint") for call in result.npm_calls))
        self.assertTrue(any(call.startswith("test") for call in result.npm_calls))


class PlaywrightConfigTest(unittest.TestCase):
    def test_custom_port_is_isolated(self):
        env = os.environ.copy()
        env["PLAYWRIGHT_PORT"] = "3101"
        result = subprocess.run(
            [
                "node", "--input-type=module", "-e",
                "import config from './playwright.config.js';"
                "process.stdout.write(JSON.stringify({url:config.webServer.url,"
                "command:config.webServer.command,reuse:config.webServer.reuseExistingServer,"
                "baseURL:config.use.baseURL}));",
            ],
            cwd=ROOT / "frontend", env=env, capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        import json
        config = json.loads(result.stdout)
        self.assertEqual(config["url"], "http://localhost:3101")
        self.assertEqual(config["baseURL"], "http://localhost:3101")
        self.assertIn("127.0.0.1:3101", config["command"])
        self.assertFalse(config["reuse"])


if __name__ == "__main__":
    unittest.main()
