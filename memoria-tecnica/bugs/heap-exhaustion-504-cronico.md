---
tipo: bug
data: 
severidade: Alta
status: Resolvido
---

# 504 crônico por exaustão de heap da JVM sem limite

## Sintoma
Erro 504 recorrente no backend em produção, sem padrão claro de horário ou carga — intermitente o suficiente pra não ser óbvio que era memória.

## Causa raiz
O container Java rodava sem limite explícito de heap (`-Xmx`). A JVM foi consumindo memória do container até exaustão (OOM), degradando resposta até o proxy estourar o timeout e devolver 504 — sintoma de rede, causa raiz de memória.

## Solução
Limites explícitos no `ENTRYPOINT` do Dockerfile do backend: `-Xms256m -Xmx512m`. Complementado por `monitor_melvin.sh`, que monitora a memória do container, detecta OOM e reinicia preventivamente.

**Regra geral daqui pra frente:** todo container Java em produção precisa de `-Xmx` explícito — nunca deixar a JVM decidir sozinha o limite dentro de um container com memória restrita (o padrão da JVM é baseado na memória do host, não do container).

## Ligado a
- [[cobranca-em-dobro-corrida-timeout-stripe]] — mesmo *sintoma* (504 no nginx), causa raiz diferente (lá era latência transitória da Stripe; aqui é exaustão de heap). Vale checar os dois antes de assumir qual é a causa de um novo 504.
