
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import extract from 'extract-zip'
import { promisify } from 'util'

const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);


/**
 * Create a zip archive of a directory
 */
export const createZipArchive = (sourcePath, targetPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(targetPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      resolve({
        path: targetPath,
        size: archive.pointer()
      });
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourcePath, false);
    archive.finalize();
  });
};

/**
 * Extract a zip archive to a directory
 */
export const extractZipArchive = async (sourcePath, targetPath) => {
  try {
    // Ensure target directory exists
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    
    await extract(sourcePath, { dir: targetPath });
    return { success: true, path: targetPath };
  } catch (error) {
    console.error('Extraction error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * List all backup files in a directory
 */
export const listBackupFiles = async (directoryPath) => {
  try {
    if (!fs.existsSync(directoryPath)) {
      return [];
    }
    
    const files = await fsReaddir(directoryPath);
    const backupFiles = [];
    
    for (const file of files) {
      if (path.extname(file) === '.zip') {
        const filePath = path.join(directoryPath, file);
        const stats = await fsStat(filePath);
        
        backupFiles.push({
          name: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime
        });
      }
    }
    
    return backupFiles.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error listing backup files:', error);
    throw error;
  }
};

/**
 * Gets the contents/structure of a backup archive
 */
export const getBackupContents = async (backupPath) => {
  try {
    const tempDir = path.join(path.dirname(backupPath), '.temp-extract-' + Date.now());
    
    // Extract to temp directory
    await extractZipArchive(backupPath, tempDir);
    
    // Read the directory structure
    const structure = await readDirectoryStructure(tempDir);
    
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    return structure;
  } catch (error) {
    console.error('Error getting backup contents:', error);
    throw error;
  }
};

/**
 * Read a directory structure recursively
 */
export const readDirectoryStructure = async (dirPath, basePath = '') => {
  const entries = await fsReaddir(dirPath, { withFileTypes: true });
  const result = [];
  
  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);
    const fullPath = path.join(dirPath, entry.name);
    const stats = await fsStat(fullPath);
    
    if (entry.isDirectory()) {
      const children = await readDirectoryStructure(fullPath, relativePath);
      result.push({
        name: entry.name,
        path: relativePath,
        type: 'directory',
        size: stats.size,
        children
      });
    } else {
      result.push({
        name: entry.name,
        path: relativePath,
        type: 'file',
        size: stats.size,
        extension: path.extname(entry.name)
      });
    }
  }
  
  return result;
};

