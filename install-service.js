const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

class ServiceInstaller {
    constructor() {
        this.platform = os.platform();
        this.scriptDir = __dirname;
    }

    async install() {
        console.log('🔧 Installing Kevin\'s AI Memory Daemon as system service...');
        
        switch (this.platform) {
            case 'win32':
                await this.installWindowsService();
                break;
            case 'linux':
                await this.installLinuxService();
                break;
            case 'darwin':
                await this.installMacService();
                break;
            default:
                console.log('❌ Unsupported platform:', this.platform);
                process.exit(1);
        }
    }

    async installWindowsService() {
        console.log('Installing Windows service...');
        
        const serviceName = 'KevinAIMemoryDaemon';
        const serviceScript = path.join(this.scriptDir, 'windows-service.js');
        
        // Create Windows service wrapper
        const serviceWrapper = `
const { Service } = require('node-windows');
const path = require('path');

const svc = new Service({
    name: '${serviceName}',
    description: 'Kevin Gardner AI Memory Daemon - Continuous background memory management',
    script: '${path.join(this.scriptDir, 'memory-daemon.js')}',
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ],
    env: {
        name: "NODE_ENV",
        value: "production"
    }
});

svc.on('install', () => {
    console.log('✅ Service installed successfully');
    svc.start();
});

svc.install();
`;

        fs.writeFileSync(serviceScript, serviceWrapper);
        
        console.log('✅ Windows service configuration created');
        console.log('Run as administrator: node windows-service.js');
    }

    async installLinuxService() {
        console.log('Installing Linux systemd service...');
        
        const serviceFile = `
[Unit]
Description=Kevin Gardner AI Memory Daemon
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${this.scriptDir}
ExecStart=/usr/bin/node ${path.join(this.scriptDir, 'memory-daemon.js')} start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=kevin-memory-daemon
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

        const servicePath = '/etc/systemd/system/kevin-memory-daemon.service';
        
        console.log('Creating systemd service file...');
        console.log('Service file content:');
        console.log(serviceFile);
        
        console.log(`\\nTo complete installation, run as root:`);
        console.log(`sudo cp kevin-memory-daemon.service ${servicePath}`);
        console.log(`sudo systemctl daemon-reload`);
        console.log(`sudo systemctl enable kevin-memory-daemon`);
        console.log(`sudo systemctl start kevin-memory-daemon`);
        
        fs.writeFileSync('kevin-memory-daemon.service', serviceFile);
    }

    async installMacService() {
        console.log('Installing macOS LaunchDaemon...');
        
        const plistContent = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kevingardner.memory-daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>${path.join(this.scriptDir, 'memory-daemon.js')}</string>
        <string>start</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${this.scriptDir}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/kevin-memory-daemon.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/kevin-memory-daemon-error.log</string>
</dict>
</plist>
`;

        const plistPath = '/Library/LaunchDaemons/com.kevingardner.memory-daemon.plist';
        
        console.log('Creating LaunchDaemon plist...');
        fs.writeFileSync('com.kevingardner.memory-daemon.plist', plistContent);
        
        console.log(`\\nTo complete installation, run:`);
        console.log(`sudo cp com.kevingardner.memory-daemon.plist ${plistPath}`);
        console.log(`sudo launchctl load ${plistPath}`);
        console.log(`sudo launchctl start com.kevingardner.memory-daemon`);
    }
}

if (require.main === module) {
    const installer = new ServiceInstaller();
    installer.install().catch(console.error);
}

module.exports = ServiceInstaller;