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

- Support local use of Camel debugger by attaching to a running Camel route written in Java using the PID
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
