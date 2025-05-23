#!/usr/bin/env groovy

node('rhel9'){
	stage('Checkout repo') {
		deleteDir()
		git url: "https://github.com/${FORK}/camel-dap-client-vscode.git",
			branch: "${BRANCH}"
	}

	stage('Install requirements') {
		def nodeHome = tool 'nodejs-lts-20'
		env.PATH="${env.PATH}:${nodeHome}/bin"
		sh "node --version"
		sh "npm install -g typescript"
		//install cyclonedx-npm
		sh "npm install --global @cyclonedx/cyclonedx-npm"
	}

	stage('Build') {
		env.JAVA_HOME="${tool 'openjdk-17'}"
		env.PATH="${env.JAVA_HOME}/bin:${env.PATH}"
		sh "java -version"

		sh "npm ci"
		sh "npm run vscode:prepublish"
	}

	withEnv(['JUNIT_REPORT_PATH=report.xml']) {
        stage('Test') {
			wrap([$class: 'Xvnc']) {
				sh "npm test --silent"
				junit 'report.xml'
			}
        }
	}

	withEnv(['TEST_RESOURCES=test-resources','CODE_VERSION=max']) {
		stage('UI Test: OpenShift deployment') {
			wrap([$class: 'Xvnc']) {
				withCredentials([[$class: 'StringBinding', credentialsId: 'oc_developer_token', variable: 'TOKEN']]) {
					sh 'oc login --token=${TOKEN} --server=https://api.ft-417-a.fuse.integration-qe.com:6443 --insecure-skip-tls-verify=true'
					sh 'oc project camel-dap-uitest'
				}
				sh 'npm run ui-test:deploy:openshift'
			}
		}
	}

	stage('Package') {
        def packageJson = readJSON file: 'package.json'
        sh "vsce package -o vscode-debug-adapter-apache-camel-${packageJson.version}-${env.BUILD_NUMBER}.vsix --no-yarn"
        sh "npm pack && mv vscode-debug-adapter-apache-camel-${packageJson.version}.tgz vscode-debug-adapter-apache-camel-${packageJson.version}-${env.BUILD_NUMBER}.tgz"
	}

	if(params.UPLOAD_LOCATION) {
		stage('Snapshot') {
			def filesToPush = findFiles(glob: '**.vsix')
			sh "sftp -C ${UPLOAD_LOCATION}/snapshots/vscode-debug-adapter-apache-camel/ <<< \$'put -p -r ${filesToPush[0].path}'"
            stash name:'vsix', includes:filesToPush[0].path
            def tgzFilesToPush = findFiles(glob: '**.tgz')
            stash name:'tgz', includes:tgzFilesToPush[0].path
            sh "sftp -C ${UPLOAD_LOCATION}/snapshots/vscode-debug-adapter-apache-camel/ <<< \$'put -p -r ${tgzFilesToPush[0].path}'"
		}
    }
	stage('Generate SBOM'){
		packageVersion = sh(script: 'jq -rcM .version < package.json', returnStdout: true ).trim()
		sh "cyclonedx-npm --omit dev --output-file node-sbom.json"
		// install cyclonedx cli used to merge sboms:
		sh "wget https://github.com/CycloneDX/cyclonedx-cli/releases/download/v0.27.1/cyclonedx-linux-x64"
		sh "chmod +x cyclonedx-linux-x64"

		sh """./cyclonedx-linux-x64 merge \
		--hierarchical \
		--group com.github.camel-tooling \
		--name vscode-debug-adapter-apache-camel \
		--version ${packageVersion} \
		--input-files node-sbom.json camel-dap-sbom.json \
		--output-file manifest.json
		"""
		archiveArtifacts artifacts:"manifest.json"
	}
}

node('rhel9'){
	if(publishToMarketPlace.equals('true')){
		timeout(time:5, unit:'DAYS') {
			input message:'Approve deployment?', submitter: 'apupier,lheinema,tsedmik,djelinek,joshiraez,mdinizde'
		}

		stage("Publish to Marketplace") {
            unstash 'vsix'
            unstash 'tgz'
            withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
                def vsix = findFiles(glob: '**.vsix')
                sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
            }
            archiveArtifacts artifacts:"**.vsix,**.tgz"

            stage "Promote the build to stable"
            def vsix = findFiles(glob: '**.vsix')
            sh "sftp -C ${UPLOAD_LOCATION}/stable/vscode-debug-adapter-apache-camel/ <<< \$'put -p -r ${vsix[0].path}'"

            def tgz = findFiles(glob: '**.tgz')
            sh "sftp -C ${UPLOAD_LOCATION}/stable/vscode-debug-adapter-apache-camel/ <<< \$'put -p -r ${tgz[0].path}'"

            sh "npm install -g ovsx"
			withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
				sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${vsix[0].path}"
			}
        }
	}
}
