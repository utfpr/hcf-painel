/* eslint-disable import/no-default-export */
export default {
  resolveSnapshotPath(testPath: string, extension: string): string {
    const testSourceFile = testPath
      .replace('/src/', '/test/__snapshots__/')
    return testSourceFile + extension
  },
  resolveTestPath(snapshotFilePath: string, extension: string): string {
    const snapshotSourceFile = snapshotFilePath
      .replace('/test/__snapshots__/', '/src/')
      .replace(extension, '')
    return snapshotSourceFile
  },
  testPathForConsistencyCheck: 'path/file.test.ts'
}
