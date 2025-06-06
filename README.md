# heimdall-test

Este repositório tem como objetivo realizar testes de carga (load tests) para três ambientes distintos: **AWS**, **Firebase** e **Heimdall**, utilizando a biblioteca [Vegeta](https://github.com/tsenart/vegeta).

## Estrutura do Projeto

O projeto está organizado em três diretórios principais:

- `aws/`
- `firebase/`
- `heimdall/`

Cada diretório contém:
- Um script `test.sh` para executar os testes de carga.
- Arquivos de relatório (`reportx100.html`, `reportx1000.html`, `reportx10000.html`) com comparativos de latência e execução.
- Um arquivo `targets.txt` com os alvos dos testes.

## Como Executar os Testes

1. **Configure as credenciais:**
   - Crie um arquivo `.env` em cada pasta (`aws/` e `firebase/`) com as credenciais necessárias.
   - Exemplo de `.env` para o Firebase:
     ```env
     FIREBASE_API_KEY=...
     FIREBASE_AUTH_DOMAIN=...
     FIREBASE_PROJECT_ID=...
     FIREBASE_STORAGE_BUCKET=...
     FIREBASE_MESSAGING_SENDER_ID=...
     FIREBASE_APP_ID=...
     ```
   - Para AWS, adicione as variáveis necessárias conforme sua configuração.

2. **Execute o script de teste:**
   - No terminal, navegue até a pasta desejada e execute:
     ```sh
     ./test.sh
     ```
   - Novos relatórios serão gerados automaticamente.

## Requisitos
- [Vegeta](https://github.com/tsenart/vegeta) instalado no sistema.
- Permissão de execução para os scripts `test.sh`.

## Observações
- Os relatórios em HTML permitem comparar a latência e o desempenho entre os ambientes testados.
- Certifique-se de que as credenciais estejam corretas e válidas antes de rodar os testes.

---

Para dúvidas ou sugestões, abra uma issue neste repositório.
