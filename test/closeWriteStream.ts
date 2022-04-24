import fs from 'fs';

export async function closeWriteStream(stream: fs.WriteStream) {
    return new Promise<void>((resolve, reject) => {
        stream.close((err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}
