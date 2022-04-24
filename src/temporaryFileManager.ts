import tmp from "tmp-promise";
import fs from "fs";

export interface ITemporaryFileInfo {
	name: string;
	tmp: tmp.FileResult;
}

export class TemporaryFileManager {
	private files: ITemporaryFileInfo[] = [];

	public getFiles() {
		return this.files;
	}

	public async newTempFile(name: string): Promise<ITemporaryFileInfo> {
		if (this.files.find(v => v.name === name)) {
			throw new Error(`${name} already exists`);
		}

		const temporaryFile = await tmp.file()
		this.files.push({
			tmp: temporaryFile,
			name,
		});

		return {
			name,
			tmp: temporaryFile
		};
	}

	public async createWriteStreamForName(name: string) {
		const fileInfo = this.getFile(name);

		return fs.createWriteStream(fileInfo.tmp.path);
	}

	public getFile(name: string) {
		const fileInfo = this.files.find(v => v.name === name);
		if (!fileInfo) {
			throw new Error(`${name} not found`);
		}
		return fileInfo;
	}

	public async createReadStreamForName(name: string) {
		const fileInfo = this.getFile(name);
		if (!fileInfo) {
			throw new Error(`${name} not found`);
		}
		return fs.createReadStream(fileInfo.tmp.path)
	}

	public async delete(name: string) {
		const fileInfo = this.getFile(name);
		if (!fileInfo) {
			throw new Error(`${name} not found`);
		}
		await fileInfo.tmp.cleanup();
		this.files = this.files.filter(v => v.name !== name);
	}

	public async cleanup() {
		await Promise.allSettled(this.files.map(v => v.tmp.cleanup));
	}
}