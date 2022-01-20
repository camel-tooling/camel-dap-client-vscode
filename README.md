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

Provide Camel textual debugging capabilities for Apache Camel routes. The [supported scope](https://github.com/camel-tooling/camel-debug-adapter/blob/main/README.md#supported-scope) is described on the Debug Adapter for Apache Camel readme.

## Requirements

For the Debugger, Java 11+ must be installed on the machine.

For the Camel application under debug, please see [requirements on the Debug Adapter readme](https://github.com/camel-tooling/camel-debug-adapter/blob/main/README.md#requirements).
