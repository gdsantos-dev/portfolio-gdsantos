# Prévia do Liquio no Contato

A branch de integração parte de da77068, o Contato v22 do PR #9. O adaptador compartilhado é carregado somente pelas quatro páginas iniciais. O pacote privado é provisionado no computador do revisor. A branch pública contém apenas o código do portfólio e o verificador da distribuição.

## Executar no PowerShell

Na pasta do Liquio, execute `npm run build`. Na pasta do portfólio, execute:

```powershell
node scripts/prepare-liquio-preview.mjs 'CAMINHO/liquio-studio-2.0.0-rc.1.tgz'
$env:HOST='127.0.0.1'
$env:PORT='4327'
npm start
```

O instalador confere o SHA-256 antes da extração, preserva os bytes distribuídos de src e assets e verifica instalações existentes. A pasta gerada em public/assets/liquio/2.x é ignorada pelo Git e pelo contexto da imagem Docker. A versão 1.0.0 fica em seu diretório histórico.

| Avaliar | Endereço local |
|---|---|
| Lateral da assinatura no desktop e faixa inferior no mobile | [Contato](http://127.0.0.1:4327/pt/#contato) |
| Caminhada na faixa inferior | [Piso](http://127.0.0.1:4327/pt/?place=floor&demo=walk#contato) |
| Figurino e gesto de Carnaval | [Carnaval](http://127.0.0.1:4327/pt/?theme=carnaval&demo=seasonal#contato) |
| Contato sem personagem | [Desativado](http://127.0.0.1:4327/pt/?liquio=off#contato) |

Também podem ser usados os caminhos /, /en/ e /es/. Em loopback, theme admite original, natal, halloween, carnaval, sao-joao e ano-novo. demo admite walk, wave, point, sit, views e seasonal. A caminhada de demonstração depende de um piso alcançável. A reação aos links usa foco ou entrada do ponteiro e tem intervalo mínimo de 14 segundos.

## Política do host

A configuração no início de public/contact-guide.js mantém ativação externa e calendário desligados. O host passa períodos com anos e fuso America/Sao_Paulo ao calendário do pacote. A URL de prévia aceita apenas temas conhecidos e parâmetros locais. Cada sessão recebe no máximo uma observação inicial quando o armazenamento da sessão está disponível.

O chão lateral alinha os pés à base da assinatura. Em larguras menores, o chão usa o espaço livre entre o fim dos canais e o início do rodapé. A faixa exclui o conteúdo interativo por construção. Nenhum link é registrado como superfície. Os dois destinos autorizados ficam dentro do piso. O modo compacto prioriza repouso e observação. Espaço insuficiente ou preferência por movimento reduzido desativam o personagem.

## Verificar e desfazer

Com o servidor e Playwright disponíveis, execute `node scripts/check-contact-guide.mjs`. LIQUIO_PLAYWRIGHT e LIQUIO_BROWSER podem indicar a instalação local e o executável. LIQUIO_ENGINE aceita chromium, firefox ou webkit. Para usar Firefox ou WebKit, remova LIQUIO_BROWSER ou informe o executável correspondente. O relatório local é gravado em .local-review ou no destino definido em LIQUIO_EVIDENCE.

Para validar em telefone, use a mesma prévia em uma rede privada autorizada, permitindo acesso somente ao telefone. O modo local por nome de loopback funciona diretamente em Android com encaminhamento USB da porta 4327 (`adb reverse tcp:4327 tcp:4327`); abra localhost:4327 no aparelho. Conferir as três línguas em retrato e paisagem, links, zoom, seleção de texto, retorno após bloquear a tela e a preferência de movimento reduzido.

Para rollback imediato na prévia, abra a URL com liquio=off. Para desmontar na mesma página, execute `(await import('/contact-guide.js')).setEnabled(false)` no console. A sessão cancela montagens em andamento e libera ambiente, cérebro, observadores e listeners da seção. A página volta ao estado inicial. A remoção definitiva consiste em retirar o script contact-guide.js das quatro entradas ou reverter os commits da integração. HTML, estilos do Contato e recursos históricos pertencem ao host e independem do pacote.

Uma publicação futura requer aprovação artística e funcional, autorização para promover a versão e provisionamento da distribuição aprovada na imagem de produção. Nesse momento, rever a exclusão do Docker, o pin do pacote e a configuração de ativação. Recursos enviados ao navegador podem ser inspecionados pelos visitantes. O provisionamento privado e os direitos do proprietário continuam independentes da exposição do site.
