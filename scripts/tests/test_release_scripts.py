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
                bin_dir / "git",
                """#!/bin/sh
case "$1" in
  diff) echo git_diff >> "$CALL_LOG"; exit "${MOCK_GIT_DIRTY:-0}" ;;
  ls-files)
    case "$*" in
      *--others*) if [ "${MOCK_UNTRACKED:-0}" = 1 ]; then echo untracked-file; fi ;;
      *) printf 'deploy.sh\\0' ;;
    esac
    exit 0 ;;
  rev-parse) echo mockcommit; exit 0 ;;
esac
exit 1
""",
            )
            executable(
                bin_dir / "rsync",
                """#!/bin/sh
echo "$*" >> "$MOCK_RSYNC_LOG"
case " $* " in
  *' --dry-run '*)
    case " $* " in
      *' --delete '*)
        echo deletion_scan >> "$CALL_LOG"
        if [ "${MOCK_DELETION:-0}" = 1 ]; then echo 'deleting unexpected-file'; fi
        exit "${MOCK_DELETION_SCAN_STATUS:-0}" ;;
      *) echo dry_run >> "$CALL_LOG"; exit "${MOCK_DRY_RUN_STATUS:-0}" ;;
    esac ;;
  *) echo transfer >> "$CALL_LOG"; exit "${MOCK_TRANSFER_STATUS:-0}" ;;
esac
""",
            )
            executable(
                bin_dir / "docker",
                """#!/bin/sh
case "$1" in
  inspect) echo inspect_db >> "$CALL_LOG"; echo "${MOCK_DB_RUNNING:-true}"; exit 0 ;;
  compose) echo compose_up >> "$CALL_LOG"; echo "compose_args $*" >> "$CALL_LOG"; exit "${MOCK_COMPOSE_STATUS:-0}" ;;
esac
exit 1
""",
            )
            executable(bin_dir / "curl", '#!/bin/sh\necho "curl $*" >> "$CALL_LOG"\nexit "${MOCK_CURL_STATUS:-0}"\n')
            executable(bin_dir / "sleep", '#!/bin/sh\nexit 0\n')
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
        self.assertEqual(events, ["smoke", "git_diff", "backup"])

    def test_dry_run_failure_blocks_transfer(self):
        result, events = self.run_script("remote", MOCK_DRY_RUN_STATUS="23")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "git_diff", "backup", "deletion_scan", "dry_run"])

    def test_deletion_scan_failure_blocks_transfer(self):
        result, events = self.run_script("remote", MOCK_DELETION_SCAN_STATUS="23")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "git_diff", "backup", "deletion_scan"])

    def test_dry_run_deletion_blocks_transfer_without_printing_filename(self):
        result, events = self.run_script("remote", MOCK_DELETION="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "git_diff", "backup", "deletion_scan"])
        self.assertNotIn("unexpected-file", result.stdout + result.stderr)

    def test_remote_deploy_failure_is_reported(self):
        result, events = self.run_script("remote", MOCK_REMOTE_STATUS="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events[:7], ["smoke", "git_diff", "backup", "deletion_scan", "dry_run", "git_diff", "transfer"])
        self.assertEqual(events[-1], "remote_deploy")

    def test_dry_run_and_transfer_preserve_remote_metadata(self):
        result, events = self.run_script("remote")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(events[:7], ["smoke", "git_diff", "backup", "deletion_scan", "dry_run", "git_diff", "transfer"])
        self.assertEqual(events[-1], "remote_deploy")
        self.assertEqual(len(result.rsync_calls), 3)
        self.assertTrue(all("--checksum" in call for call in result.rsync_calls))
        self.assertTrue(all("--no-times" in call for call in result.rsync_calls))
        self.assertTrue(all("--no-perms" in call for call in result.rsync_calls))
        self.assertTrue(all("--no-owner" in call for call in result.rsync_calls))
        self.assertTrue(all("--no-group" in call for call in result.rsync_calls))
        self.assertIn("--delete", result.rsync_calls[0])
        self.assertTrue(all("--files-from=" in call for call in result.rsync_calls[1:]))
        self.assertTrue(all("--from0" in call for call in result.rsync_calls[1:]))
        self.assertTrue(all("--delete" not in call for call in result.rsync_calls[1:]))

    def test_dirty_checkout_blocks_remote_actions(self):
        result, events = self.run_script("remote", MOCK_GIT_DIRTY="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "git_diff"])

    def test_untracked_checkout_blocks_remote_actions(self):
        result, events = self.run_script("remote", MOCK_UNTRACKED="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["smoke", "git_diff"])

    def test_local_docker_failure_is_reported(self):
        result, events = self.run_script(MOCK_COMPOSE_STATUS="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("compose_up", events)

    def test_stopped_database_blocks_compose(self):
        result, events = self.run_script(MOCK_DB_RUNNING="false")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(events, ["inspect_db"])

    def test_failed_http_health_is_reported(self):
        result, events = self.run_script(MOCK_CURL_STATUS="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("compose_up", events)
        self.assertTrue(any(event.startswith("curl ") for event in events))

    def test_local_deploy_does_not_stop_host_database(self):
        result, events = self.run_script()
        self.assertEqual(result.returncode, 0)
        self.assertNotIn("sudo", events)
        self.assertIn("inspect_db", events)
        self.assertTrue(any("--no-deps" in event for event in events))
        self.assertTrue(any("127.0.0.1:8443/actuator/health" in event for event in events))
        self.assertTrue(any("127.0.0.1:3000/" in event for event in events))

    @unittest.skipUnless(shutil.which("rsync"), "rsync não instalado")
    def test_rsync_manifest_sends_only_tracked_files_and_preserves_remote_only(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "source"
            destination = root / "destination"
            source.mkdir()
            destination.mkdir()
            (source / "tracked.txt").write_text("versionado")
            (source / "untracked.txt").write_text("local")
            (destination / "remote-only.txt").write_text("remoto")
            manifest = root / "manifest"
            manifest.write_bytes(b"tracked.txt\0")

            subprocess.run(
                ["rsync", "-av", "--from0", f"--files-from={manifest}",
                 f"{source}/", f"{destination}/"],
                check=True, capture_output=True, text=True,
            )

            self.assertEqual((destination / "tracked.txt").read_text(), "versionado")
            self.assertFalse((destination / "untracked.txt").exists())
            self.assertEqual((destination / "remote-only.txt").read_text(), "remoto")


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
