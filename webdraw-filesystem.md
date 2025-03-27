# The Webdraw File System

## Introduction

AI Apps could be way more powerful if we could combine them. I brainstorm ideas in Chat GPT. Create logos in Midjourney. But when I go code in Cursor, I still have to do all the lifting to combine everything. *Haja Copy Paste*.

We believe the missing piece of tech in the AI age is a **distributed filesystem**. Using the same UNIX terminology (`readdir`, `ls`) that all LLMs know well. And, of course, **AI-first**.

This is the **Webdraw Filesystem**. It's the backbone of [webdraw.com](https://webdraw.com), and I'm going to show you what you can do with it. [(What's a Filesystem)](https://en.wikipedia.org/wiki/File_system)

### Use Cases

- Reusing generations and prompts between AI Apps
- Database for apps, games, creators
- Storage for your custom models (e.g., Lora, ElevenLabs)
- Productivity suite (e.g., Blog editor, Slides editor)

## SDK

The Webdraw Filesystem offers a **Software Development Kit (SDK)** that allows Webdraw Apps to manage files and create amazing AI experiences with personal context. In this post, we'll explore the filesystem using interactive examples that call Webdraw SDK methods. You can run these examples directly and see the results in your own filesystem!

## Home Directory

All users have their own home directory—it's your personal folder. In Webdraw, the symbol `~` refers to your home directory. When you use an app, the data you generate or upload is stored **in your home directory**.

Apps leverage the home directory to create a unified experience, allowing you to **reuse generations and prompts** across different apps.

Just like in your operating system (Windows, Mac, Linux), **default folders** make it easier to find important files:

- `Apps`: Apps you create and shortcuts to apps from the Webdraw Community.
- `Pictures`: Images and GIFs generated in apps.
- `Videos`: Video generations.
- `Audios`: Audio generations.
- `Documents`: General data generated in apps.
- `www`: Public deploy.

### Demo: fs.list

Let's list all files and folders in your home directory using `fs.list(path: string)`. We'll run `fs.list('~/')` to see what's there.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

const files = await SDK.fs.list('~/');
console.log({ files });
```

## Absolute Filesystem

When we listed files in `~/`, you might have noticed the paths look like `/users/e9d97947-0c1a-4909-b396-1cf6c7f0577/...`. This is the **absolute path** to your home directory. The SDK works with both **absolute paths** (e.g., `/users/.../Bloom/db.json`) and **relative paths** (e.g., `~/Bloom/db.json`).

## Filesystem Methods

Below are all the Webdraw Filesystem methods, complete with descriptions, signatures, example scenarios, and interactive demos. Run the examples to see them in action on your own filesystem!

### fs.exists

Checks if a file or directory exists at a given path.

**Method Signature:**

```typescript
fs.exists(filepath: string): Promise<boolean>
```

- `filepath`: The path to check.
- **Returns**: A promise resolving to `true` if the path exists, `false` otherwise.

**Example Scenario:**

Check if `~/tmp` exists in your home directory.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

const exists = await SDK.fs.exists('~/tmp');
console.log(`Does ~/tmp exist? ${exists}`);
```

### fs.cwd

Returns the current working directory as an absolute path.

**Method Signature:**

```typescript
fs.cwd(): string
```

**Returns**: The absolute path of the current working directory.

**Example Scenario:**

Find out your current working directory.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

const currentDir = SDK.fs.cwd();
console.log(`Current working directory: ${currentDir}`);
```

### fs.list

Lists all files and directories in a specified folder.

**Method Signature:**

```typescript
fs.list(filter?: string): Promise<string[]>
```

- `filter`: An optional path or pattern to filter results.
- **Returns**: A promise resolving to an array of file and directory paths.

**Example Scenario:**

List all files and folders inside `~/tmp`.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

const files = await SDK.fs.list('~/tmp');
console.log('Files in ~/tmp:', files);
```

### fs.mkdir

Creates a new directory at the specified path.

**Method Signature:**

```typescript
fs.mkdir(filepath: string, options?: { recursive?: boolean; mode?: number }): Promise<void>
```

- `filepath`: The path where the directory will be created.
- `options.recursive`: If `true`, creates parent directories if they don't exist.
- `options.mode`: Optional numeric permissions mode.

**Example Scenario:**

Create a directory called `test` inside `~/tmp`.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

await SDK.fs.mkdir('~/tmp/test', { recursive: true });
console.log('Created directory ~/tmp/test');
```

### fs.write

Writes text to a file, creating it if it doesn't exist.

**Method Signature:**

```typescript
fs.write(filepath: string, text: string, options?: BufferEncoding | ObjectEncodingOptions | null): Promise<void>
```

- `filepath`: The path to the file.
- `text`: The content to write.
- `options`: Optional encoding settings.

**Example Scenario:**

Write "Hello, Webdraw!" to `~/tmp/greeting.txt`.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

await SDK.fs.write('~/tmp/greeting.txt', 'Hello, Webdraw!');
console.log('Wrote to ~/tmp/greeting.txt');
```

### fs.readFile

Reads the contents of a file.

**Method Signature:**

```typescript
fs.readFile(filepath: string, options?: ReadFileOptions): Promise<string | Uint8Array>
```

- `filepath`: The path to the file.
- `options`: Optional settings like encoding.
- **Returns**: A promise resolving to the file content as a string (default UTF-8) or `Uint8Array` for binary data.

**Example Scenario:**

Read the contents of `~/tmp/greeting.txt`.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

const content = await SDK.fs.readFile('~/tmp/greeting.txt');
console.log('Content of greeting.txt:', content);
```

### fs.stat

Provides details about a file or directory, like size and timestamps.

**Method Signature:**

```typescript
fs.stat(filepath: string): Promise<StatsLike<number> | null>
```

- `filepath`: The path to check.
- **Returns**: A promise resolving to a `StatsLike` object or `null` if the path doesn't exist.

**Example Scenario:**

Get information about `~/tmp/greeting.txt`.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

const stats = await SDK.fs.stat('~/tmp/greeting.txt');
if (stats) {
  console.log('File size:', stats.size);
  console.log('Last modified:', new Date(stats.mtimeMs).toLocaleString());
} else {
  console.log('File not found');
}
```

### fs.remove

Deletes a file or directory.

**Method Signature:**

```typescript
fs.remove(filepath: string): Promise<void>
```

- `filepath`: The path to delete.

**Example Scenario:**

Delete `~/tmp/greeting.txt`.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

await SDK.fs.remove('~/tmp/greeting.txt');
console.log('Deleted ~/tmp/greeting.txt');
```

### fs.chmod

Changes a file or directory's permissions.

**Method Signature:**

```typescript
fs.chmod(filepath: string, mode: number): Promise<void>
```

- `filepath`: The path to modify.
- `mode`: Numeric permissions (e.g., `0o644`).

**Example Scenario:**

Make `~/tmp/greeting.txt` readable by everyone (accessible at `fs.webdraw.com/users/userid/greeting.txt`).

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

await SDK.fs.chmod('~/tmp/greeting.txt', 0o644);
console.log('Set permissions of ~/tmp/greeting.txt to 0o644');
```

### fs.relative

Converts an absolute path to a relative one based on the current working directory.

**Method Signature:**

```typescript
fs.relative(filepath: string): string
```

- `filepath`: The absolute path to convert.
- **Returns**: The relative path.

**Example Scenario:**

Find the relative path to `~/tmp/greeting.txt`.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

const relativePath = SDK.fs.relative('~/tmp/greeting.txt');
console.log('Relative path:', relativePath);
```

### fs.symlink

Creates a symbolic link pointing to a target path.

**Method Signature:**

```typescript
fs.symlink(target: string, path: string): Promise<void>
```

- `target`: The path the symlink points to.
- `path`: Where to create the symlink.

**Example Scenario:**

Create a symlink `link.txt` in `~/tmp` pointing to `greeting.txt`.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

await SDK.fs.symlink('~/tmp/greeting.txt', '~/tmp/link.txt');
console.log('Created symlink ~/tmp/link.txt -> ~/tmp/greeting.txt');
```

### fs.readlink

Reads the target of a symbolic link.

**Method Signature:**

```typescript
fs.readlink(filepath: string): Promise<string>
```

- `filepath`: The path to the symlink.
- **Returns**: A promise resolving to the target path.

**Example Scenario:**

Check where `~/tmp/link.txt` points.

```typescript
import { SDK } from "https://webdraw.com/webdraw-sdk@v1";

const target = await SDK.fs.readlink('~/tmp/link.txt');
console.log('Symlink target:', target);
```

## Additional Tips

- **Path Formats**: Use absolute paths (`/`), relative paths, or home directory paths (`~/`)—the SDK resolves them automatically.
- **Error Handling**: Wrap calls in `try/catch` to manage errors like "file not found" or "permission denied."
- **Public Access**: Use `fs.chmod` with permissions like `0o644` to make files available at `fs.webdraw.com/users/userid/file.json`.

This guide equips you with the knowledge to use Webdraw SDK filesystem methods effectively, from basic operations like checking existence to advanced features like symbolic links. 