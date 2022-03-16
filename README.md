[![Build and Test](https://github.com/camel-tooling/camel-dap-client-vscode/actions/workflows/ci.yaml/badge.svg)](https://github.com/camel-tooling/camel-dap-client-vscode/actions/workflows/ci.yaml)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=camel-tooling_camel-dap-client-vscode&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=camel-tooling_camel-dap-client-vscode)

# VS Code Debug Adapter client for Apache Camel

![A breakpoint hit on a Camel route endpoint and the variables displayed](./docs/images/breakpoint.png)

## How to use it

- Start a Camel application
- Grab the PID of the java process
- In `.vscode/launch.json`, provide this kind of content:
  ```json
  {
	"version": "0.2.0",
	"configurations": [
		{
			"type": "apache.camel",
			"request": "attach",
			"name": "Attach Camel Debugger",
			"attach_pid": "857136"
		}
	]
  }
  ```
- In `Run and Debug` panel, launch the `Attach Camel Debugger`
- Put a breakpoint on the Camel route
- Enjoy!

## Features

- Support local use of Camel debugger by attaching to a running Camel route written in Java, Yaml or XML (only `Camel Main` mode for XML) using the PID
- Support a single Camel context
- Add/Remove breakpoint
- Inspect variable values on suspended breakpoints
- Resume a single route instance and resume all route instances
- Stepping when the route definition is in the same file

## Requirements

Java Runtime Environment 11+ with com.sun.tools.attach.VirtualMachine (available in most JVMs such as Hotspot and OpenJDK) must be available on system path.

The Camel instance to debug must follow these requirements:
  - Camel 3.15+
  - Have camel-debug on the classpath
  - Have JMX enabled

## Usage data

The Debug Adapter for Apache Camel by Red Hat extension collects anonymous [usage data](USAGE_DATA.md) and sends it to Red Hat servers to help improve our products and services. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection) to learn more. This extension respects the redhat.telemetry.enabled setting which you can learn more about at https://github.com/redhat-developer/vscode-redhat-telemetry#how-to-disable-telemetry-reporting
