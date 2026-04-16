# Introdução

Informações básicas do projeto.

* **Projeto:** STOCK.TECH
* **Repositório GitHub:** [https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-1-p1-tiaw-t1-722102-gestao-de-estoque.git]
* **Membros da equipe:**

  * [Andrew Kaique Ferreira de Paula](https://github.com/4K4i-dev)
  * [Bruno Maciel Lima Silva](https://github.com/BrunoMaciel-r)
  * [Paulo Haniel Macedo de Castro](https://github.com/paulo-h30)
  * [Pedro Henrique Faria Godinho](https://github.com/pedrofariad1)
  * [Sophia Emanuelle de Morais dos Santos](https://github.com/sophiamsantos)
  * [Thiago Henrique Almeida Domingos](https://github.com/Thiaguim00)
  * [Vitória Letícia de Oliveira](https://gist.github.com/VitoriaLdo)

A documentação do projeto é estruturada da seguinte forma:

1. Introdução
2. Contexto
3. Product Discovery
4. Product Design
5. Metodologia
6. Solução
7. Referências Bibliográficas

✅ [Documentação de Design Thinking (MIRO)](files/processo-dt.pdf)

# Contexto

O projeto visa desenvolver uma plataforma web para automatizar o controle de inventários, eliminando falhas humanas e processos manuais que geram prejuízos. A ferramenta centraliza dados em tempo real para otimizar o fluxo de mercadorias e garantir que a gestão de ativos seja um motor de crescimento, e não um gargalo operacional.

## Problema

De que maneira a implementação de uma plataforma de gestão automatizada pode mitigar a inconsistência de dados e reduzir as perdas financeiras causadas pela gestão ineficiente de estoque em empresas de pequeno e médio porte?

## Objetivos

### Objetivo Geral
* **Desenvolver** e implementar um sistema web que integre o controle de entradas, saídas e a previsibilidade de demanda para otimizar o gerenciamento de mercadorias em tempo real.

### Objetivos Específicos
* **Mapear** os principais pontos de erro e gargalos nos processos manuais de inventário atuais;
* **Desenvolver** uma interface intuitiva para o monitoramento de indicadores de desempenho (KPIs);
* **Implementar** um sistema de alertas automáticos para níveis críticos de estoque e datas de validade;
* **Garantir** a sincronização de dados entre diferentes canais de venda (estoque unificado).

## Justificativa

A justificativa deste projeto fundamenta-se na necessidade de **eficiência financeira** e **sobrevivência de mercado**. O estoque representa um dos maiores ativos de uma empresa e sua má gestão resulta em capital imobilizado ou perda de vendas por falta de produtos. 

A transição para um modelo tecnológico (utilizando infraestrutura robusta e, futuramente, inteligência de dados) permite:

1. **Redução de Desperdícios:** Controle rigoroso que evita vencimentos e perdas;
2. **Tomada de Decisão Estratégica:** Gestores passam a atuar baseados em dados reais, não em suposições;
3. **Escalabilidade:** A estrutura digital permite que o volume de operações cresça sem que o controle se perca.

## Público-Alvo

*A quem se destina a solução.*

* **Pequenos e Médios Varejistas:** Que buscam digitalizar o controle de suas lojas físicas;
* **Gestores de E-commerce:** Que necessitam de integração entre vendas online e estoque físico;
* **Administradores de Almoxarifado:** Profissionais que buscam agilidade na auditoria e rastreabilidade de lotes;
* **Microempreendedores (MEIs):** Que necessitam de uma ferramenta acessível e simples para organizar seus primeiros fluxos de suprimentos.

# Product Discovery

## Etapa de Entendimento
* **Matriz CSD**: Também conhecida por Matriz de Alinhamento, é uma ferramenta utilizada no Design Thinking para organizar informações e facilitar o processo de tomada de decisão e solução de problemas;

![](/docs/images/Matriz%20CSD.png)

* **Mapa de stakeholders**: ferramenta que nos permite compreender o grupo de pessoas e entidades que devemos estudar e conversar para entender mais sobre o problema;

![](/docs/images/Mapa%20de%20Stakeholders.png)

## Etapa de Definição

Pesquisa e Entendimento do Problema

A gestão de estoque é um desafio comum em pequenas e médias empresas, principalmente devido ao uso de métodos manuais, como planilhas e anotações. Esses métodos aumentam a chance de erros, como informações desatualizadas, perda de produtos e inconsistência nos dados.

Além disso, a falta de controle em tempo real dificulta a tomada de decisões, como reposição de produtos e planejamento de compras. Isso pode gerar dois problemas principais: a falta de mercadorias, causando perda de vendas, e o excesso de estoque, resultando em desperdício e capital parado.

Outro fator relevante é a ausência de integração entre setores, como vendas e estoque, o que torna o processo mais lento e menos eficiente. Dessa forma, percebe-se a necessidade de soluções tecnológicas que automatizem esses processos, reduzam falhas humanas e melhorem a organização das empresas.



### Personas

![](/docs/images/Persona1.jpg)
![](/docs/images/Persona2.jpg)
![](/docs/images/Persona3.jpg)
# Product Design

Nesse momento, vamos transformar os insights e validações obtidos em soluções tangíveis e utilizáveis. Essa fase envolve a definição de uma proposta de valor, detalhando a prioridade de cada ideia e a consequente criação de wireframes, mockups e protótipos de alta fidelidade, que detalham a interface e a experiência do usuário.

## Histórias de Usuários

Com base na análise das personas foram identificadas as seguintes histórias de usuários:

EU COMO... `PERSONA` | QUERO/PRECISO ... `FUNCIONALIDADE` | PARA ... `MOTIVO/VALOR` |
| :--- | :--- | :--- |
| **José Roberto (Proprietário de Depósito)** | Ter uma visualização instantânea de itens em nível crítico | Acabar com as perdas visíveis e invisíveis no meu estoque |
| **José Roberto (Proprietário de Depósito)** | Acessar o sistema via mobile | Substituir o caderno de papel de forma eficiente enquanto circulo pelo estoque |
| **Maria Aparecida (Loja de Roupa)** | Saber exatamente quais peças estão disponíveis por tamanho, cor e modelo | Evitar perder vendas por falta de controle e agilizar o atendimento |
| **Maria Aparecida (Loja de Roupa)** | Um sistema intuitivo com interface visual e poucos cliques | Conseguir usar a ferramenta sem precisar de ajuda técnica |
| **Lucas Almeida (Hamburgueria)** | Saber em tempo real a quantidade de insumos disponíveis | Não correr o risco de ficar sem ingredientes essenciais durante o expediente |
| **Lucas Almeida (Hamburgueria)** | Registrar entradas e saídas de forma ágil e direta | Facilitar a organização do dia a dia sem interromper a operação da cozinha |
| **Administrador do Sistema** | Visualizar um Dashboard com métricas e controle financeiro claro | Ter segurança na tomada de decisões e tranquilidade na gestão do negócio |

## Proposta de Valor
##### Proposta de valor para Persona XPTO ⚠️ EXEMPLO ⚠️

![](/docs/images/Proposta1.jpg)
![](/docs/images/Proposta2.jpg)
![](/docs/images/Proposta3.jpg)

O mapa da proposta de valor é uma ferramenta que nos ajuda a definir qual tipo de produto ou serviço melhor atende às personas definidas anteriormente.

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto.

### Requisitos Funcionais

| ID     | Descrição do Requisito                                                                 | Prioridade |
| ------ | -------------------------------------------------------------------------------------- | ---------- |
| RF-001 | O sistema deve permitir o registro e o controle de produtos no estoque. | ALTA |
| RF-002 | O sistema deve fornecer uma ferramenta de busca rápida de produtos. | ALTA |
| RF-003 | O sistema deve apresentar um dashboard de entrada e saída de mercadorias. | ALTA |
| RF-004 | O sistema deve permitir a visualização do estoque atualizado em tempo real. | ALTA |
| RF-005 | O sistema deve disponibilizar funcionalidade de login e cadastro de usuários. | ALTA |
| RF-006 | O sistema deve permitir o controle de validade dos produtos. | MÉDIA |
| RF-007 | O sistema deve registrar o histórico de movimentações de estoque. | MÉDIA |
| RF-008 | O sistema deve auxiliar na previsão de compras baseada nos dados do sistema.| MÉDIA |
| RF-009 | O sistema deve permitir a configuração de usuários com diferentes níveis de acesso. | MÉDIA |
| RF-010 | O sistema deve realizar o controle de custos por produto. | MÉDIA |
| RF-011 | O sistema deve permitir o armazenamento de Notas Fiscais (NF's) de entrada. | BAIXA |
| RF-012 | O sistema deve gerar relatórios básicos e dashboards visuais avançados. | BAIXA |

### Requisitos Não Funcionais

| ID      | Descrição do Requisito                                                                                             | Prioridade |
| ------- | ------------------------------------------------------------------------------------------------------------------ | ---------- |
| RNF-001 | **Usabilidade**: O sistema deve possuir uma interface direta, fácil e simplificada para o usuário. | ALTA |
| RNF-002 | **Confiabilidade**: O sistema deve centralizar as informações em um único sistema para evitar divergências. | ALTA |
| RNF-003 | **Disponibilidade**: O sistema deve oferecer um manual de uso para auxílio imediato ao usuário. | MÉDIA |
| RNF-004 | **Estética**: O sistema deve possuir uma página inicial bem elaborada e melhorias constantes no layout. | BAIXA |
| RNF-005 | **Padronização**: A interface deve seguir uma padronização de cores, temas e ajustes visuais de usabilidade. | BAIXA |

## Projeto de Interface

Artefatos relacionados com a interface e a interacão do usuário na proposta de solução.

### Wireframes

Estes são os protótipos de telas do sistema.

**✳️✳️✳️ COLOQUE AQUI OS PROTÓTIPOS DE TELAS COM TÍTULO E DESCRIÇÃO ✳️✳️✳️**

##### TELA XPTO ⚠️ EXEMPLO ⚠️

Descrição para a tela XPTO

![wireframe1](/docs/images/wireframe1.png)
![wireframe2](/docs/images/wireframe2.png)
![wireframe3](/docs/images/wireframe3.png)
![wireframe4](/docs/images/wireframe4.png)
![wireframe5](/docs/images/wireframe5.png)
![wireframe6](/docs/images/wireframe6.png)
![wireframe7](/docs/images/wireframe7.png)
![wireframe8](/docs/images/wireframe8.png)
>
> Wireframes são protótipos das telas da aplicação usados em design de interface para sugerir a estrutura de um site web e seu relacionamentos entre suas páginas. Um wireframe web é uma ilustração semelhante ao layout de elementos fundamentais na interface.
>
> **Orientações**:
>
> - [Ferramentas de Wireframes](https://rockcontent.com/blog/wireframes/)
> - [Figma](https://www.figma.com/)
> - [Adobe XD](https://www.adobe.com/br/products/xd.html#scroll)
> - [MarvelApp](https://marvelapp.com/developers/documentation/tutorials/)

### User Flow

![userflow1](/docs/images/useflow1.png)
![userflow2](/docs/images/useflow2.png)
![userflow3](/docs/images/useflow3.png)
![userflow4](/docs/images/useflow4.png)

Fluxo de usuário (User Flow) é uma técnica que permite ao desenvolvedor mapear todo fluxo de telas do site ou app. Essa técnica funciona para alinhar os caminhos e as possíveis ações que o usuário pode fazer junto com os membros de sua equipe.

> **Orientações**:
> - [User Flow: O Quê É e Como Fazer?](https://medium.com/7bits/fluxo-de-usu%C3%A1rio-user-flow-o-que-%C3%A9-como-fazer-79d965872534)
> - [User Flow vs Site Maps](http://designr.com.br/sitemap-e-user-flow-quais-as-diferencas-e-quando-usar-cada-um/)
> - [Top 25 User Flow Tools &amp; Templates for Smooth](https://www.mockplus.com/blog/post/user-flow-tools)

### Protótipo Interativo

✅ [Protótipo Interativo (Figma)](https://www.figma.com/design/zr3j44N13WegE4wui7BqWa/Prototipo-interativo?node-id=0-1&t=kihCAzdEOi9nsAAR-1)

# Metodologia

Detalhes sobre a organização do grupo e o ferramental empregado.

## Ferramentas

Relação de ferramentas empregadas pelo grupo durante o projeto.

| Ambiente                    | Plataforma | Link de acesso                                     |
| --------------------------- | ---------- | -------------------------------------------------- |
| Processo de Design Thinking | Miro       | https://miro.com/app/board/uXjVGtgsglc=/?share_link_id=664930094612        |
| Repositório de código     | GitHub     | https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-1-p1-tiaw-t1-722102-gestao-de-estoque.git      |
| Protótipo Interativo       | Figma  | https://www.figma.com/design/zr3j44N13WegE4wui7BqWa/Prototipo-interativo?node-id=0-1&t=kihCAzdEOi9nsAAR-1   |
|                             |            |                                                    |
## Gerenciamento do Projeto

Organização da Equipe e Divisão de Tarefas

A equipe organizou a divisão das atividades de forma estratégica, distribuindo as funcionalidades do sistema entre os integrantes, de acordo com suas responsabilidades no desenvolvimento do projeto.

Cada membro ficou responsável por uma parte específica da aplicação, contribuindo tanto no desenvolvimento quanto na integração das funcionalidades.

A divisão das tarefas ocorreu da seguinte forma:

Andrew Kaique Ferreira de Paula: Desenvolvimento do dashboard e visão geral do sistema;
Bruno Maciel Lima Silva: Desenvolvimento do módulo financeiro;
Vitória Letícia de Oliveira: Responsável pela funcionalidade de movimentações de estoque;
Sophia Emanuelle de Morais dos Santos: Desenvolvimento do módulo de cadastro e gerenciamento de produtos;
Paulo Haniel Macedo de Castro: Responsável pelo módulo de pedidos de venda;
Thiago Henrique Almeida Domingos: Desenvolvimento do módulo de contatos;
Pedro Henrique Faria Godinho: Responsável pela área de FAQ (Perguntas Frequentes).

Além disso, a equipe colaborou em conjunto na construção da tela inicial do sistema, garantindo uma visão geral clara e intuitiva para o usuário.

Essa divisão permitiu maior organização, produtividade e especialização nas funcionalidades, facilitando o desenvolvimento do projeto de forma colaborativa.

![Kaban](/docs/images/KABAN.png)

## Referências Bibliográficas

GESTÃO PRO. Como o ERP para pequenas empresas transforma o controle de estoque. Disponível em: https://gestaopro.com.br/blog/estoque/como-o-erp-para-pequenas-empresas-transforma-o-controle-de-estoque
. Acesso em: 8 abr. 2026.
→ Utilizado para embasar a importância da automação na gestão de estoque.

GESTÃO PRO. Erros comuns na gestão de estoque e como um sistema pode resolver. Disponível em: https://gestaopro.com.br/blog/gestao/erros-comuns-na-gestao-de-estoque-e-como-um-sistema-pode-resolver
. Acesso em: 8 abr. 2026.
→ Utilizado para identificar falhas frequentes nos processos manuais.

ANDRA SISTEMAS. Gestão de estoque para pequenos negócios. Disponível em: https://www.andrasistemas.com.br/blog/gestao-de-estoque-para-pequenos-negocios
. Acesso em: 8 abr. 2026.
→ Utilizado para reforçar a importância da organização e controle eficiente.

Controle de estoque nas microempresas. Arquivo em formato PDF. Acesso em: 07 mar. 2026.
→ Utilizado para compreender as principais funcionalidades necessárias em um sistema de gestão de estoque, especialmente no contexto de microempresas.

PLATAFORMA FLASH. Sistema administrativo (acesso restrito). Acesso em: 28 mar. 2026.
→ Utilizado como referência visual para o desenvolvimento do design da interface, especialmente o menu lateral e a estrutura geral do sistema.

> **Orientações**:
> - [Sobre Projects - GitHub Docs](https://docs.github.com/pt/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
> - [Gestão de projetos com GitHub | balta.io](https://balta.io/blog/gestao-de-projetos-com-github)
> - [(460) GitHub Projects - YouTube](https://www.youtube.com/playlist?list=PLiO7XHcmTsldZR93nkTFmmWbCEVF_8F5H)
> - [11 Passos Essenciais para Implantar Scrum no seu Projeto](https://mindmaster.com.br/scrum-11-passos/)
> - [Scrum em 9 minutos](https://www.youtube.com/watch?v=XfvQWnRgxG0)

# Solução Implementada

Esta seção apresenta todos os detalhes da solução criada no projeto.

## Vídeo do Projeto

O vídeo a seguir traz uma apresentação do problema que a equipe está tratando e a proposta de solução. ⚠️ EXEMPLO ⚠️

[![Vídeo do projeto](images/video.png)](https://www.youtube.com/embed/70gGoFyGeqQ)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> O video de apresentação é voltado para que o público externo possa conhecer a solução. O formato é livre, sendo importante que seja apresentado o problema e a solução numa linguagem descomplicada e direta.
>
> Inclua um link para o vídeo do projeto.

## Funcionalidades

Esta seção apresenta as funcionalidades da solução.Info

##### Funcionalidade 1 - Cadastro de Contatos ⚠️ EXEMPLO ⚠️

Permite a inclusão, leitura, alteração e exclusão de contatos para o sistema

* **Estrutura de dados:** [Contatos](#ti_ed_contatos)
* **Instruções de acesso:**
  * Abra o site e efetue o login
  * Acesse o menu principal e escolha a opção Cadastros
  * Em seguida, escolha a opção Contatos
* **Tela da funcionalidade**:

![Tela de Funcionalidade](images/exemplo-funcionalidade.png)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente cada uma das funcionalidades que a aplicação fornece tanto para os usuários quanto aos administradores da solução.
>
> Inclua, para cada funcionalidade, itens como: (1) titulos e descrição da funcionalidade; (2) Estrutura de dados associada; (3) o detalhe sobre as instruções de acesso e uso.

## Estruturas de Dados

Descrição das estruturas de dados utilizadas na solução com exemplos no formato JSON.Info

##### Estrutura de Dados - Contatos   ⚠️ EXEMPLO ⚠️

Contatos da aplicação

```json
  {
    "id": 1,
    "nome": "Leanne Graham",
    "cidade": "Belo Horizonte",
    "categoria": "amigos",
    "email": "Sincere@april.biz",
    "telefone": "1-770-736-8031",
    "website": "hildegard.org"
  }
  
```

##### Estrutura de Dados - Usuários  ⚠️ EXEMPLO ⚠️

Registro dos usuários do sistema utilizados para login e para o perfil do sistema

```json
  {
    id: "eed55b91-45be-4f2c-81bc-7686135503f9",
    email: "admin@abc.com",
    id: "eed55b91-45be-4f2c-81bc-7686135503f9",
    login: "admin",
    nome: "Administrador do Sistema",
    senha: "123"
  }
```

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente as estruturas de dados utilizadas na solução tanto para dados utilizados na essência da aplicação quanto outras estruturas que foram criadas para algum tipo de configuração
>
> Nomeie a estrutura, coloque uma descrição sucinta e apresente um exemplo em formato JSON.
>
> **Orientações:**
>
> * [JSON Introduction](https://www.w3schools.com/js/js_json_intro.asp)
> * [Trabalhando com JSON - Aprendendo desenvolvimento web | MDN](https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Objects/JSON)

## Módulos e APIs

Esta seção apresenta os módulos e APIs utilizados na solução

**Images**:

* Unsplash - [https://unsplash.com/](https://unsplash.com/) ⚠️ EXEMPLO ⚠️

**Fonts:**

* Icons Font Face - [https://fontawesome.com/](https://fontawesome.com/) ⚠️ EXEMPLO ⚠️

**Scripts:**

* jQuery - [http://www.jquery.com/](http://www.jquery.com/) ⚠️ EXEMPLO ⚠️
* Bootstrap 4 - [http://getbootstrap.com/](http://getbootstrap.com/) ⚠️ EXEMPLO ⚠️

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente os módulos e APIs utilizados no desenvolvimento da solução. Inclua itens como: (1) Frameworks, bibliotecas, módulos, etc. utilizados no desenvolvimento da solução; (2) APIs utilizadas para acesso a dados, serviços, etc.

# Referências

As referências utilizadas no trabalho foram:

* SOBRENOME, Nome do autor. Título da obra. 8. ed. Cidade: Editora, 2000. 287 p ⚠️ EXEMPLO ⚠️

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.
>
> **Orientações**:
>
> - [Formato ABNT](https://www.normastecnicas.com/abnt/trabalhos-academicos/referencias/)
> - [Referências Bibliográficas da ABNT](https://comunidade.rockcontent.com/referencia-bibliografica-abnt/)
