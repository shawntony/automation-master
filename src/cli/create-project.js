import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import boxen from 'boxen'
import { ProjectCreator } from '../utils/project-creator.js'

/**
 * 프로젝트 생성 CLI
 */
export async function createProject() {
  console.log(
    boxen(chalk.cyan.bold('🚀 프로젝트 생성 도우미'), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    })
  )

  console.log(chalk.gray('새로운 프로젝트를 생성합니다.\n'))

  try {
    // 1. 프로젝트 정보 입력
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '프로젝트 이름을 입력하세요:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return '프로젝트 이름을 입력해주세요'
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return '프로젝트 이름은 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다'
          }
          return true
        }
      },
      {
        type: 'list',
        name: 'projectType',
        message: '프로젝트 타입을 선택하세요:',
        choices: [
          {
            name: '📱 Fullstack - 웹앱 전체 (프론트엔드 + 백엔드 + DB)',
            value: 'fullstack'
          },
          {
            name: '🎨 Frontend - UI/UX만 (프론트엔드)',
            value: 'frontend'
          },
          {
            name: '⚙️  Backend - API + DB (백엔드)',
            value: 'backend'
          },
          {
            name: '🤖 Automation - 스크립트/도구',
            value: 'automation'
          }
        ],
        default: 'fullstack'
      }
    ])

    // 2. 생성 경로 확인
    const projectPath = `C:\\Users\\gram\\myautomation\\${answers.projectName}`
    console.log(
      chalk.gray(`\n📂 생성 경로: ${chalk.cyan(projectPath)}\n`)
    )

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '이 경로에 프로젝트를 생성하시겠습니까?',
        default: true
      }
    ])

    if (!confirm) {
      console.log(chalk.yellow('\n프로젝트 생성이 취소되었습니다.'))
      return
    }

    // 3. 프로젝트 생성
    const spinner = ora('프로젝트 생성 중...').start()

    const creator = new ProjectCreator()
    const result = await creator.createProject(
      answers.projectName,
      answers.projectType
    )

    if (result.success) {
      spinner.succeed(chalk.green('프로젝트 생성 완료!'))

      // 4. 성공 메시지 출력
      displaySuccessMessage(result.projectPath, answers.projectName, answers.projectType)
    } else {
      spinner.fail(chalk.red('프로젝트 생성 실패'))
      console.log(chalk.red(`\n❌ ${result.message}\n`))
    }
  } catch (error) {
    console.error(chalk.red('\n❌ 오류 발생:'), error.message)
  }
}

/**
 * 성공 메시지 출력
 */
function displaySuccessMessage(projectPath, projectName, projectType) {
  console.log()
  console.log(
    boxen(
      chalk.green.bold('✅ 프로젝트 생성 완료!') +
        '\n\n' +
        chalk.white(`프로젝트명: ${chalk.cyan(projectName)}`) +
        '\n' +
        chalk.white(`타입: ${chalk.cyan(projectType)}`) +
        '\n' +
        chalk.white(`경로: ${chalk.cyan(projectPath)}`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    )
  )

  // 복사된 파일 목록
  console.log(chalk.cyan.bold('\n📚 복사된 가이드 (project-guide/):'))
  const guideDocs = [
    'planning.md - 10단계 개발 가이드',
    'PROJECT_SUMMARY.md - 프로젝트 요약',
    'WEB_APP_GUIDE.md - 웹앱 개발 가이드',
    'WEB_CLI_INTEGRATION.md - CLI-웹 통합 가이드',
    'WORKFLOW_GUIDE.md - 워크플로우 가이드'
  ]
  guideDocs.forEach((doc) => {
    console.log(chalk.gray(`  ✓ ${doc}`))
  })

  // 생성된 파일 목록
  console.log(chalk.cyan.bold('\n🤖 생성된 파일:'))
  const generatedFiles = [
    'agents-guide.md - 에이전트 활용 가이드',
    'project-workflow.md - 프로젝트 워크플로우',
    'README.md - 프로젝트 개요',
    '.claude/commands/create-prd.md - PRD 생성 명령어',
    'config/progress.json - 진행상황 추적',
    '.gitignore - Git 설정'
  ]
  generatedFiles.forEach((file) => {
    console.log(chalk.gray(`  ✓ ${file}`))
  })

  // 사용 가능한 에이전트
  console.log(chalk.cyan.bold('\n🤖 설정된 에이전트:'))
  const agents = [
    'task-decomposition-expert - 작업 분해 및 ChromaDB 통합',
    'project-supervisor-orchestrator - 워크플로우 조율',
    'supabase-schema-architect - DB 스키마 설계'
  ]
  agents.forEach((agent) => {
    console.log(chalk.gray(`  ✓ ${agent}`))
  })

  // 다음 단계
  console.log(chalk.cyan.bold('\n📋 다음 단계:'))
  console.log(chalk.white(`  1. ${chalk.yellow(`cd ${projectPath}`)}`))
  console.log(chalk.white('  2. README.md 확인'))
  console.log(chalk.white('  3. PRD 작성 또는 업로드'))
  console.log(chalk.white('  4. project-guide/planning.md 참조하여 개발 시작'))
  console.log(chalk.white('  5. agents-guide.md에서 에이전트 활용법 확인'))

  console.log()
  console.log(
    boxen(chalk.green.bold('프로젝트를 성공적으로 시작하세요! 🎉'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'green'
    })
  )
}
