'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Workflow,
  Sparkles,
  Database,
  Layout,
  Wrench,
  FileSpreadsheet,
  Settings,
  FileText,
  FileType,
  Cog,
  MessageCircle,
  BarChart3,
  Code2,
  Zap,
  TrendingUp,
  Presentation,
  BookOpen,
  FolderPlus,
  GitMerge
} from 'lucide-react'

const navItems = [
  {
    name: '홈',
    href: '/',
    icon: Home
  },
  {
    name: '워크플로우',
    href: '/workflow',
    icon: Workflow
  },
  {
    name: '새 프로젝트 만들기',
    href: '/create-project',
    icon: FolderPlus,
    badge: 'NEW'
  },
  {
    name: '통합 워크플로우',
    href: '/unified-workflow',
    icon: GitMerge,
    badge: 'BETA'
  },
  {
    name: '웹앱 생성기',
    icon: Sparkles,
    children: [
      {
        name: '풀스택 생성기',
        href: '/generators/fullstack',
        icon: Sparkles,
        badge: '5분'
      },
      {
        name: '백엔드 생성기',
        href: '/generators/backend',
        icon: Database
      },
      {
        name: '프론트엔드 생성기',
        href: '/generators/frontend',
        icon: Layout
      }
    ]
  },
  {
    name: '자동화 도구',
    icon: Zap,
    children: [
      {
        name: 'Apps Script 생성기',
        href: '/tools/appscript',
        icon: Code2,
        badge: 'NEW'
      },
      {
        name: '제안서 자동 생성',
        href: '/tools/proposal',
        icon: Presentation,
        badge: 'NEW'
      },
      {
        name: 'Google Sheets 마이그레이션',
        href: '/tools/migration',
        icon: FileSpreadsheet
      },
      {
        name: 'Telegram 봇',
        href: '/tools/telegram',
        icon: MessageCircle
      }
    ]
  },
  {
    name: '데이터 추출',
    icon: Wrench,
    children: [
      {
        name: 'PDF 추출 도구',
        href: '/tools/pdf',
        icon: FileText
      },
      {
        name: 'HWP 추출 도구',
        href: '/tools/hwp',
        icon: FileType
      }
    ]
  },
  {
    name: '분석 & 리포트',
    icon: TrendingUp,
    children: [
      {
        name: 'Metabase 대시보드',
        href: '/tools/metabase',
        icon: BarChart3
      },
      {
        name: '프로젝트 대시보드',
        href: '/dashboard',
        icon: Settings
      }
    ]
  },
  {
    name: '사용 매뉴얼',
    href: '/manual',
    icon: BookOpen
  },
  {
    name: '환경 설정',
    href: '/settings',
    icon: Cog
  }
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1">AutomationMaster</h1>
        <p className="text-xs text-gray-400">+ SSA 통합</p>
      </div>

      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.name}>
            {item.children ? (
              <div>
                <div className="flex items-center gap-2 px-3 py-2 text-gray-300 text-sm font-medium">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
                <ul className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const Icon = child.icon
                    const isActive = pathname === child.href
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded text-sm
                            ${isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          {child.name}
                          {child.badge && (
                            <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <Link
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded text-sm
                  ${pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
                {item.badge && (
                  <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-8 p-3 bg-gray-800 rounded text-xs">
        <p className="text-gray-400 mb-1">SSA 통합 완료 ✅</p>
        <p className="text-gray-500">Version 1.1.0</p>
      </div>
    </nav>
  )
}
