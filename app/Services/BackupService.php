<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BackupService
{
    public function createDatabaseBackup()
    {
        try {
            // Create backup directory if it doesn't exist
            if (!Storage::exists('backups')) {
                Storage::makeDirectory('backups');
            }

            $filename = 'backup_' . Carbon::now()->format('Y-m-d_H-i-s') . '.sql';
            $backupPath = storage_path('app/backups/' . $filename);

            // Get database configuration
            $connection = config('database.default');
            $config = config("database.connections.{$connection}");

            if ($connection === 'sqlite') {
                $this->createSqliteBackup($config['database'], $backupPath);
            } elseif ($connection === 'mysql') {
                $this->createMysqlBackup($config, $backupPath);
            } else {
                throw new \Exception("Backup not supported for {$connection} database");
            }

            return [
                'success' => true,
                'filename' => $filename,
                'path' => $backupPath,
                'size' => $this->formatBytes(filesize($backupPath))
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function restoreDatabase($backupFile)
    {
        try {
            // Store uploaded file temporarily
            $tempPath = $backupFile->store('temp', 'local');
            $fullPath = storage_path('app/' . $tempPath);

            // Validate the file (check if it's a valid SQL dump)
            $fileContent = file_get_contents($fullPath);
            if (strpos($fileContent, 'PRAGMA') === false && strpos($fileContent, 'CREATE TABLE') === false) {
                Storage::disk('local')->delete($tempPath);
                return [
                    'success' => false,
                    'error' => 'Invalid backup file format'
                ];
            }

            // Get database path
            $databasePath = database_path('database.sqlite');

            // Create backup of current database before restore
            $currentBackup = storage_path('app/backups/pre_restore_' . date('Y-m-d_H-i-s') . '.sql');
            if (file_exists($databasePath)) {
                $command = sprintf('sqlite3 "%s" .dump > "%s"', $databasePath, $currentBackup);
                exec($command);
            }

            // Restore database from backup
            if (file_exists($databasePath)) {
                unlink($databasePath); // Remove current database
            }

            // Create new database from backup
            $command = sprintf('sqlite3 "%s" < "%s"', $databasePath, $fullPath);
            exec($command, $output, $returnCode);

            // Clean up temp file
            Storage::disk('local')->delete($tempPath);

            if ($returnCode === 0) {
                return [
                    'success' => true,
                    'filename' => $backupFile->getClientOriginalName()
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Failed to restore database. Command returned code: ' . $returnCode
                ];
            }

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function createSqliteBackup($databasePath, $backupPath)
    {
        if (!file_exists($databasePath)) {
            throw new \Exception('SQLite database file not found');
        }

        // Use SQLite's .dump command
        $command = sprintf(
            'sqlite3 %s .dump > %s',
            escapeshellarg($databasePath),
            escapeshellarg($backupPath)
        );

        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            throw new \Exception('SQLite backup failed');
        }
    }

    private function createMysqlBackup($config, $backupPath)
    {
        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s --port=%s %s > %s',
            escapeshellarg($config['username']),
            escapeshellarg($config['password']),
            escapeshellarg($config['host']),
            escapeshellarg($config['port']),
            escapeshellarg($config['database']),
            escapeshellarg($backupPath)
        );

        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            throw new \Exception('MySQL backup failed');
        }
    }

    public function getBackupHistory()
    {
        $backupFiles = Storage::files('backups');
        $backups = [];

        foreach ($backupFiles as $file) {
            if (str_ends_with($file, '.sql')) {
                $backups[] = [
                    'filename' => basename($file),
                    'path' => $file,
                    'size' => $this->formatBytes(Storage::size($file)),
                    'created_at' => Carbon::createFromTimestamp(Storage::lastModified($file))
                ];
            }
        }

        // Sort by creation time, newest first
        usort($backups, function ($a, $b) {
            return $b['created_at']->timestamp - $a['created_at']->timestamp;
        });

        return $backups;
    }

    public function deleteBackup($filename)
    {
        $filePath = 'backups/' . $filename;
        
        if (Storage::exists($filePath)) {
            Storage::delete($filePath);
            return true;
        }
        
        return false;
    }

    public function downloadBackup($filename)
    {
        $filePath = 'backups/' . $filename;
        
        if (Storage::exists($filePath)) {
            return Storage::download($filePath);
        }
        
        throw new \Exception('Backup file not found');
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    public function cleanOldBackups($keepDays = 30)
    {
        $cutoffDate = Carbon::now()->subDays($keepDays);
        $backups = $this->getBackupHistory();
        $deletedCount = 0;

        foreach ($backups as $backup) {
            if ($backup['created_at']->lt($cutoffDate)) {
                if ($this->deleteBackup($backup['filename'])) {
                    $deletedCount++;
                }
            }
        }

        return $deletedCount;
    }
}
