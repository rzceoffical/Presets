import path from 'path'

export default definePreset({
  name: 'presets',
  options: {
    web: false,
    repo: false,
    public: false,
  },
  handler: async (context) => {
    if (context.options.web) {
      await installWeb(
        path
          .parse(context.applyOptions.targetDirectory)
          .name.toLocaleLowerCase()
      )
    }

    if (context.options.repo) {
      await initializeProject(context.options.public)
    }
  },
})

async function installWeb(name: string) {
  await group({
    title: 'install dependencies',
    handler: async () => {
      await installPackages({
        title: `install packages`,
        dev: true,
        for: 'node',
        packages: ['parcel', 'prettier'],
        type: 'install',
        packageManager: 'yarn',
      })
      await editFiles({
        files: 'package.json',
        operations: [
          {
            type: 'edit-json',
            merge: {
              name: `${name}`,
            },
          },
          {
            type: 'edit-json',
            merge: {
              scripts: {
                dev: 'parcel src/index.html',
                build: 'parcel build src/index.html',
              },
            },
          },
        ],
      })
    },
  })

  await group({
    title: 'extract project template',
    handler: async () => {
      await extractTemplates({
        from: 'web',
        title: 'extracting web-template',
      })
    },
  })
}

async function initializeProject(publicRepo: boolean) {
  await group({
    title: 'initialize repository',
    handler: async () => {
      await executeCommand({
        command: 'git',
        arguments: ['init'],
      })

      await executeCommand({
        command: 'git',
        arguments: ['add', '.'],
      })

      await executeCommand({
        command: 'git',
        arguments: ['commit', '-m', 'Initial Commit'],
      })

      if (publicRepo) {
        await executeCommand({
          command: 'gh',
          arguments: ['repo', 'create', '--public', '--source', '.', '--push'],
        })
      } else {
        await executeCommand({
          command: 'gh',
          arguments: ['repo', 'create', '--private', '--source', '.', '--push'],
        })
      }
    },
  })
}
