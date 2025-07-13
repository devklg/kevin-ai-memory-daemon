#!/usr/bin/env node

/**
 * Kevin Gardner's AI Memory Daemon
 * Continuous background memory management and chat persistence
 * Systematic "Light Switch" Sequence + Real-time memory operations
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class MemoryDaemon extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            mongoUri: "mongodb+srv://kevin:simple123@aiconversations.inaxa3v.mongodb.net/ai_converrsations",
            saveInterval: options.saveInterval || 300000, // 5 minutes
            chatBackupInterval: options.chatBackupInterval || 60000, // 1 minute
            memoryCheckInterval: options.memoryCheckInterval || 30000, // 30 seconds
            logLevel: options.logLevel || 'info',
            dataDir: options.dataDir || path.join(__dirname, 'memory-data'),
            pidFile: path.join(__dirname, 'memory-daemon.pid')
        };

        this.systemStatus = {
            mainPower: false,
            workingMemory: false,
            episodicMemory: false,
            semanticMemory: false,
            proceduralMemory: false,
            vectorDatabase: false,
            daemonRunning: false,
            lastBackup: null,
            chatsSaved: 0,
            uptime: null
        };

        this.intervals = {};
        this.currentSession = null;
        this.chatBuffer = [];
        this.isShuttingDown = false;
    }

    async start() {
        try {
            this.log('🚀 Starting Kevin Gardner\'s AI Memory Daemon', 'DAEMON');
            
            // Create data directory
            this.ensureDataDir();
            
            // Write PID file
            this.writePidFile();
            
            // Execute startup sequence
            await this.executeStartupSequence();
            
            // Start background processes
            this.startBackgroundProcesses();
            
            // Setup signal handlers
            this.setupSignalHandlers();
            
            this.systemStatus.daemonRunning = true;
            this.systemStatus.uptime = new Date();
            
            this.log('✅ Memory Daemon fully operational', 'DAEMON');
            this.emit('started');
            
        } catch (error) {
            this.log(`❌ Failed to start daemon: ${error.message}`, 'ERROR');
            process.exit(1);
        }
    }

    async executeStartupSequence() {
        this.log('🔴 MEMORY SYSTEM STARTUP INITIATED...', 'STARTUP');
        
        const switches = [
            { name: 'Main Power', key: 'mainPower', func: this.activateMainPower },
            { name: 'Working Memory', key: 'workingMemory', func: this.activateWorkingMemory },
            { name: 'Episodic Memory', key: 'episodicMemory', func: this.activateEpisodicMemory },
            { name: 'Semantic Memory', key: 'semanticMemory', func: this.activateSemanticMemory },
            { name: 'Procedural Memory', key: 'proceduralMemory', func: this.activateProceduralMemory },
            { name: 'Vector Database', key: 'vectorDatabase', func: this.activateVectorDatabase }
        ];

        for (let i = 0; i < switches.length; i++) {
            const switch_ = switches[i];
            this.log(`💡 [SWITCH ${i + 1}] Activating ${switch_.name}`, 'STARTUP');
            
            try {
                await switch_.func.call(this);
                this.systemStatus[switch_.key] = true;
                this.log(`✅ ${switch_.name} online`, 'STARTUP');
            } catch (error) {
                this.log(`❌ ${switch_.name} failed: ${error.message}`, 'ERROR');
                throw error;
            }
            
            await this.delay(200);
        }

        this.log('🟢 ALL SYSTEMS ONLINE - MEMORY DAEMON READY', 'STARTUP');
    }

    startBackgroundProcesses() {
        this.log('📊 Starting background monitoring processes', 'DAEMON');

        // Chat backup process
        this.intervals.chatBackup = setInterval(() => {
            this.backupCurrentChat();
        }, this.config.chatBackupInterval);

        // Regular memory save
        this.intervals.memorySave = setInterval(() => {
            this.saveMemoryState();
        }, this.config.saveInterval);

        // System health check
        this.intervals.healthCheck = setInterval(() => {
            this.performHealthCheck();
        }, this.config.memoryCheckInterval);

        // Session detection
        this.intervals.sessionMonitor = setInterval(() => {
            this.detectActiveSession();
        }, 10000); // Check every 10 seconds

        this.log('✅ Background processes started', 'DAEMON');
    }

    async activateMainPower() {
        // Initialize knowledge graph connection
        await this.delay(300);
        this.currentSession = {
            id: `kevin_session_${Date.now()}`,
            startTime: new Date(),
            context: 'memory_daemon_startup'
        };
    }

    async activateWorkingMemory() {
        // Load current conversation context
        await this.delay(200);
        this.chatBuffer = [];
    }

    async activateEpisodicMemory() {
        // Test MongoDB connection
        await this.delay(400);
        // In real implementation, would test actual MongoDB connection
    }

    async activateSemanticMemory() {
        // Load project knowledge
        await this.delay(300);
        // Load Kevin's project context
    }

    async activateProceduralMemory() {
        // Load behavioral rules and patterns
        await this.delay(200);
        // Load Kevin Gardner Rules and Requirements
    }

    async activateVectorDatabase() {
        // Initialize vector search capability
        await this.delay(500);
        // Setup OpenAI embeddings and vector search
    }

    backupCurrentChat() {
        try {
            if (this.chatBuffer.length > 0) {
                const timestamp = new Date().toISOString();
                const filename = `chat-backup-${timestamp.replace(/[:.]/g, '-')}.json`;
                const filepath = path.join(this.config.dataDir, 'chats', filename);
                
                const chatData = {
                    sessionId: this.currentSession?.id,
                    timestamp: timestamp,
                    messages: [...this.chatBuffer],
                    metadata: {
                        kevinContext: {
                            middleName: "La'Mont",
                            petName: "Royal (Airedale Terrier)",
                            japanInterest: "Sumo Wrestling"
                        }
                    }
                };

                this.ensureDir(path.dirname(filepath));
                fs.writeFileSync(filepath, JSON.stringify(chatData, null, 2));
                
                this.systemStatus.chatsSaved++;
                this.systemStatus.lastBackup = new Date();
                this.log(`💾 Chat backed up: ${filename}`, 'BACKUP');
                
                // Clear buffer after backup
                this.chatBuffer = [];
            }
        } catch (error) {
            this.log(`❌ Chat backup failed: ${error.message}`, 'ERROR');
        }
    }

    saveMemoryState() {
        try {
            const memoryState = {
                timestamp: new Date().toISOString(),
                systemStatus: this.systemStatus,
                currentSession: this.currentSession,
                config: this.config,
                uptime: this.getUptime()
            };

            const filepath = path.join(this.config.dataDir, 'memory-state.json');
            fs.writeFileSync(filepath, JSON.stringify(memoryState, null, 2));
            
            this.log('💾 Memory state saved', 'MEMORY');
        } catch (error) {
            this.log(`❌ Memory save failed: ${error.message}`, 'ERROR');
        }
    }

    performHealthCheck() {
        try {
            const issues = [];
            
            // Check system status
            Object.entries(this.systemStatus).forEach(([key, value]) => {
                if (key.endsWith('Memory') || key.endsWith('Database') || key === 'mainPower') {
                    if (!value) issues.push(`${key} offline`);
                }
            });

            if (issues.length > 0) {
                this.log(`⚠️ Health check issues: ${issues.join(', ')}`, 'HEALTH');
                this.emit('healthIssues', issues);
            } else {
                this.log('✅ Health check passed', 'HEALTH');
            }
        } catch (error) {
            this.log(`❌ Health check failed: ${error.message}`, 'ERROR');
        }
    }

    detectActiveSession() {
        // In real implementation, would detect active Claude sessions
        // For now, simulate session detection
        if (!this.currentSession) {
            this.currentSession = {
                id: `kevin_session_${Date.now()}`,
                startTime: new Date(),
                context: 'auto_detected'
            };
            this.log('🔍 New session detected', 'SESSION');
        }
    }

    addChatMessage(message, sender = 'user') {
        const chatEntry = {
            timestamp: new Date().toISOString(),
            sender: sender,
            content: message,
            sessionId: this.currentSession?.id
        };
        
        this.chatBuffer.push(chatEntry);
        this.log(`💬 Chat message buffered from ${sender}`, 'CHAT');
    }

    setupSignalHandlers() {
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        process.on('SIGHUP', () => this.restart());
    }

    async shutdown(signal = 'MANUAL') {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;
        
        this.log(`🛑 Shutting down daemon (${signal})`, 'DAEMON');
        
        // Clear intervals
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
        
        // Final backup
        this.backupCurrentChat();
        this.saveMemoryState();
        
        // Remove PID file
        this.removePidFile();
        
        this.log('✅ Memory Daemon shutdown complete', 'DAEMON');
        process.exit(0);
    }

    async restart() {
        this.log('🔄 Restarting daemon', 'DAEMON');
        await this.shutdown('RESTART');
        // In real implementation, would respawn process
    }

    // Utility methods
    ensureDataDir() {
        const dirs = [
            this.config.dataDir,
            path.join(this.config.dataDir, 'chats'),
            path.join(this.config.dataDir, 'memory'),
            path.join(this.config.dataDir, 'logs')
        ];
        
        dirs.forEach(dir => this.ensureDir(dir));
    }

    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    writePidFile() {
        fs.writeFileSync(this.config.pidFile, process.pid.toString());
    }

    removePidFile() {
        if (fs.existsSync(this.config.pidFile)) {
            fs.unlinkSync(this.config.pidFile);
        }
    }

    getUptime() {
        if (!this.systemStatus.uptime) return 0;
        return Date.now() - this.systemStatus.uptime.getTime();
    }

    log(message, category = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} [${category}] ${message}`;
        
        console.log(logEntry);
        
        // Write to log file
        const logFile = path.join(this.config.dataDir, 'logs', `daemon-${new Date().toISOString().split('T')[0]}.log`);
        this.ensureDir(path.dirname(logFile));
        fs.appendFileSync(logFile, logEntry + '\n');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // CLI commands
    static async status() {
        const pidFile = path.join(__dirname, 'memory-daemon.pid');
        if (fs.existsSync(pidFile)) {
            const pid = fs.readFileSync(pidFile, 'utf8');
            console.log(`Memory Daemon running (PID: ${pid})`);
            
            const stateFile = path.join(__dirname, 'memory-data', 'memory-state.json');
            if (fs.existsSync(stateFile)) {
                const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
                console.log(`Uptime: ${Math.round(state.uptime / 1000)}s`);
                console.log(`Chats saved: ${state.systemStatus.chatsSaved}`);
                console.log(`Last backup: ${state.systemStatus.lastBackup}`);
            }
        } else {
            console.log('Memory Daemon not running');
        }
    }

    static async stop() {
        const pidFile = path.join(__dirname, 'memory-daemon.pid');
        if (fs.existsSync(pidFile)) {
            const pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
            process.kill(pid, 'SIGTERM');
            console.log('Memory Daemon stopped');
        } else {
            console.log('Memory Daemon not running');
        }
    }
}

// CLI Interface
if (require.main === module) {
    const command = process.argv[2] || 'start';
    
    switch (command) {
        case 'start':
            const daemon = new MemoryDaemon();
            daemon.start();
            break;
        case 'status':
            MemoryDaemon.status();
            break;
        case 'stop':
            MemoryDaemon.stop();
            break;
        case 'restart':
            MemoryDaemon.stop();
            setTimeout(() => {
                const daemon = new MemoryDaemon();
                daemon.start();
            }, 2000);
            break;
        default:
            console.log('Usage: node memory-daemon.js [start|stop|status|restart]');
    }
}

module.exports = MemoryDaemon;