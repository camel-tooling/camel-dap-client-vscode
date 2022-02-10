# Change Log

All notable changes to the "vscode-debug-adapter-apache-camel" extension will be documented in this file.

## 0.0.2

- Add keywords to the extension to have a better discoverability in the Marketplace

## 0.0.1

- Support local use of Camel debugger by attaching to a running Camel route written in Java using the PID
- Support a single Camel context
- Add/Remove breakpoint
- Inspect variable values on suspended breakpoints
- Resume a single route instance and resume all route instances
- Stepping when the route definition is in the same file
- The Camel instance to debug must follow these requirements:
  - Camel 3.15+
  - Have camel-debug on the classpath
  - Have JMX enabled
- The Camel Debug Server Adapter must use Java Runtime Environment 11+ with com.sun.tools.attach.VirtualMachine (available in most JVMs such as Hotspot and OpenJDK).
