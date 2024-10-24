## Introduction

Welcome to the `VS Code extension Debug Adapter for Apache Camel` project created by Red Hat! Here you'll find a description of how to use VS Code extension providing Debug Adapter for Apache Camel.

## Description

This extension adds <a href="https://camel.apache.org/manual/debugger.html">Camel Debugger</a> power by attaching to a running Camel route written in Java, Yaml or XML DSL directly in your Visual Studio Code editor. It is working as a client using the [Microsoft Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) which communicates with [Camel Debug Server](https://github.com/camel-tooling/camel-debug-adapter) providing all functionalities.

## How to install

1. You can download **Debug Adapter for Apache Camel** extension from the [VS Code Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-debug-adapter-apache-camel) and the [Open VSX Registry](https://open-vsx.org/extension/redhat/vscode-debug-adapter-apache-camel).
2. Debug Adapter for Apache Camel can be also installed directly in the [Microsoft VS Code](https://code.visualstudio.com/).

    **Steps**
    - Open your VS Code.
    - In VS Code, select **View > Extensions**.
    - In the search bar, type `Camel Debug`
    - Select the **Debug Adapter for Apache Camel** option and then click `Install`.

## Features

- Add/Remove breakpoints
- Support a single Camel context
- `Camel Main` mode for XML only
- Supports the use of Camel debugger
- Supports the local use of Camel debugger
- Support remote debug through http (when using Jolokia on server-side)
- Support conditional breakpoint with `simple` language.
- Inspect variable values on suspended breakpoints
- Resume a single route instance and resume all route instances
- Pause/resume route definition. Technically, it suspend/stop and resume/start Camel routes depending on the kind of consumer. Note that there is a single Camel route there is no thread visible in the Call stack due to VS Code implementation choice.
- Stepping when the route definition is in the same file
- Allow to update values of variables:
  - in the `Debugger` scope
  - the message body
  - a message header of type String
  - an exchange property of type String
- Commands `Run with JBang and Debug Opened Camel Integration`, `Run with JBang and Debug All Camel Integrations from workspace root` and `Run with JBang and Debug All Camel Integrations from containing folder`. It allows a one-click start and Camel debug in simple cases. This command is available through:
  - Command Palette. It requires a valid Camel file opened in current editor.
  - Contextual menu in File explorer. It is visible to all `*.xml`, `*.java`, `*.yaml` and `*.yml`.
  - Codelens at the top of a Camel file (the heuristic for the codelens is checking that there is a `from` and a `to` or a `log` on `java`, `xml` and `yaml` files).
  - `Run or debug...` quick action editor
- Commands `Run with JBang and Debug Opened Camel Integration`, `Run with JBang Opened Camel Integration` and `Run with JBang All Camel Integrations from workspace root`
  - Support automatic reload mode `--dev` by default
  - It requires a valid Camel file defined in Yaml DSL (`.yaml|.yml`) opened in editor.
  - Contextual menu in File explorer. It is visible to all `*.yaml` and `*.yml`.
  - Codelens at the top of a Camel file.
  - `Run or debug...` quick action editor
- Configuration snippets for Camel debugger launch configuration
- Configuration snippets to launch Camel application ready to accept a Camel debugger connection using
  - JBang
  - or Maven with Camel maven plugin
  - or Quarkus Devs
- Deploy Integration (standalone Camel file) with [Apache Camel Kubernetes](https://camel.apache.org/manual/camel-jbang-kubernetes.html) plugin.
  - It allows **one-click deployment into OpenShift** by default
  - requires Camel JBang 4.8+
  - for deployment into Kubernetes cluster see [how to deploy into local Kubernetes cluster](./content/kubernetes-deploy.md)

### Advanced

- See [Advanced Configurations](./content/advanced.md) page with configurations examples for advanced use cases.
