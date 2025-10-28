'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle2, ExternalLink, Copy, Database, AlertCircle } from 'lucide-react'

interface MetabaseGuideProps {
  spreadsheetId: string
  spreadsheetUrl: string
  onBack: () => void
  onClose: () => void
}

const steps = [
  {
    title: 'Metabase 설치 선택',
    description: 'Metabase 클라우드 또는 셀프 호스팅 중 선택합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>1단계:</strong> Metabase 사용 방법을 선택합니다.
          </p>
          <p className="text-sm text-blue-700 mb-3">
            Metabase는 두 가지 방법으로 사용할 수 있습니다:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* 클라우드 옵션 */}
          <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-100 rounded">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900">Metabase Cloud</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Metabase에서 호스팅하는 클라우드 서비스 (권장)
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                설치 불필요
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                자동 업데이트
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                무료 체험 가능
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                유료 플랜 필요
              </div>
            </div>
            <a
              href="https://www.metabase.com/start/hosted"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Cloud 시작하기
            </a>
          </div>

          {/* 셀프 호스팅 옵션 */}
          <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-400 transition">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gray-100 rounded">
                <Database className="h-6 w-6 text-gray-600" />
              </div>
              <h4 className="font-bold text-gray-900">셀프 호스팅</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              자체 서버에 직접 설치하여 사용
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                완전 무료
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                완전한 제어권
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                설치 및 관리 필요
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                서버 리소스 필요
              </div>
            </div>
            <a
              href="https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              설치 가이드
            </a>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <strong>추천:</strong>
          </p>
          <p className="text-sm text-yellow-700">
            처음 사용하시는 경우 <strong>Metabase Cloud</strong>를 권장합니다.
            설치와 관리가 필요 없고, 빠르게 시작할 수 있습니다.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 mb-2">
            <strong>Docker로 빠르게 시작하기 (셀프 호스팅):</strong>
          </p>
          <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`docker run -d -p 3000:3000 \\
  --name metabase \\
  metabase/metabase`}
          </pre>
          <p className="text-xs text-gray-600 mt-2">
            이 명령으로 로컬에서 Metabase를 실행할 수 있습니다 (http://localhost:3000)
          </p>
        </div>
      </div>
    )
  },
  {
    title: '초기 설정',
    description: 'Metabase 계정을 생성하고 기본 설정을 완료합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>2단계:</strong> Metabase 초기 설정을 완료합니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>Metabase에 접속합니다 (Cloud 또는 localhost:3000)</li>
            <li><strong>"시작하기"</strong> 버튼을 클릭합니다</li>
            <li>언어를 <strong>한국어</strong>로 선택합니다</li>
            <li>관리자 계정 정보를 입력합니다:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>이름</li>
                <li>이메일</li>
                <li>비밀번호</li>
              </ul>
            </li>
            <li><strong>"다음"</strong>을 클릭하여 진행합니다</li>
          </ol>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 mb-3">
            <strong>📝 회사 정보 (선택사항):</strong>
          </p>
          <p className="text-sm text-purple-700 mb-2">
            다음 정보를 입력할 수 있습니다 (나중에 변경 가능):
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
            <li>회사 이름</li>
            <li>팀 규모</li>
            <li>사용 목적</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>예상 화면:</strong>
          </p>
          <div className="bg-gray-100 rounded p-4 text-center text-sm text-gray-500">
            [환영 화면]<br />
            → [언어 선택]<br />
            → [계정 생성]<br />
            → [회사 정보]<br />
            → [데이터 연결 준비]
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 mb-2">
            <strong>참고:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>초기 설정은 5분 이내로 완료됩니다</li>
            <li>설정 내용은 나중에 변경할 수 있습니다</li>
            <li>관리자 계정은 모든 권한을 갖습니다</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: 'Google Sheets 연결',
    description: 'Google Sheets를 데이터베이스로 연결합니다',
    content: (spreadsheetId: string, spreadsheetUrl: string) => {
      const [copied, setCopied] = useState(false)

      const copySpreadsheetId = () => {
        navigator.clipboard.writeText(spreadsheetId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }

      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 mb-3">
              <strong>3단계:</strong> Google Sheets를 데이터 소스로 연결합니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li>초기 설정 후 <strong>"데이터베이스 추가"</strong> 화면이 나타납니다</li>
              <li>데이터베이스 유형에서 <strong>"Google Sheets"</strong>를 선택합니다</li>
              <li>Google 계정으로 로그인하고 권한을 승인합니다</li>
              <li>아래 스프레드시트 ID를 입력합니다</li>
              <li><strong>"저장"</strong> 버튼을 클릭합니다</li>
            </ol>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 mb-3">
              <strong>📋 연결할 스프레드시트:</strong>
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-purple-700 mb-1">스프레드시트 ID:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded text-sm border border-purple-200 overflow-x-auto">
                    {spreadsheetId}
                  </code>
                  <button
                    onClick={copySpreadsheetId}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center gap-1 text-sm"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        복사
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  스프레드시트 직접 열기
                </a>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <strong>중요:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
              <li>Metabase가 스프레드시트에 액세스할 수 있도록 권한을 부여해야 합니다</li>
              <li>스프레드시트 공유 설정에서 Metabase 서비스 계정에 뷰어 권한을 추가하세요</li>
              <li>데이터 동기화는 주기적으로 이루어집니다 (실시간 아님)</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              <strong>연결 테스트:</strong>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              연결이 성공하면 다음과 같은 메시지가 표시됩니다:
            </p>
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-sm text-green-700 font-medium">
                연결 성공! 데이터베이스를 사용할 준비가 되었습니다.
              </p>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    title: '질문 만들기',
    description: '데이터를 조회하는 질문(쿼리)을 만듭니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>4단계:</strong> 데이터를 조회하는 "질문"을 만듭니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>홈 화면에서 <strong>"+ 새로 만들기"</strong> 버튼을 클릭합니다</li>
            <li><strong>"질문"</strong>을 선택합니다</li>
            <li>질문 방식을 선택합니다:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li><strong>간단한 질문:</strong> GUI로 쉽게 만들기 (권장)</li>
                <li><strong>사용자 지정 질문:</strong> SQL 직접 작성</li>
                <li><strong>네이티브 쿼리:</strong> 고급 SQL 기능 사용</li>
              </ul>
            </li>
            <li>데이터를 선택하고 필터, 요약, 정렬 등을 설정합니다</li>
            <li><strong>"시각화"</strong> 버튼을 클릭하여 결과를 확인합니다</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 mb-3">
            <strong>✅ 간단한 질문 예시:</strong>
          </p>
          <div className="space-y-3">
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-2">
                📊 월별 매출 합계
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><strong>데이터:</strong> 주문 테이블</li>
                <li><strong>측정항목:</strong> 금액의 합계</li>
                <li><strong>그룹화:</strong> 날짜별 (월)</li>
                <li><strong>시각화:</strong> 선 차트</li>
              </ul>
            </div>
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-2">
                📈 카테고리별 판매량
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><strong>데이터:</strong> 상품 테이블</li>
                <li><strong>측정항목:</strong> 개수</li>
                <li><strong>그룹화:</strong> 카테고리</li>
                <li><strong>시각화:</strong> 막대 차트</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 mb-3">
            <strong>💻 SQL 질문 예시:</strong>
          </p>
          <pre className="bg-white border border-purple-200 p-3 rounded text-xs overflow-x-auto">
{`SELECT
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) as total_revenue
FROM orders
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC`}
          </pre>
          <p className="text-xs text-purple-700 mt-2">
            SQL에 익숙하다면 더 복잡한 분석이 가능합니다
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            <strong>💡 질문 작성 팁:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            <li>간단한 질문부터 시작하여 점진적으로 복잡하게 만드세요</li>
            <li>필터를 사용하여 특정 기간이나 조건의 데이터만 조회하세요</li>
            <li>질문을 저장하면 대시보드에 추가할 수 있습니다</li>
            <li>다른 팀원과 질문을 공유할 수 있습니다</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: '시각화 선택',
    description: '데이터에 적합한 차트 유형을 선택합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>5단계:</strong> 데이터를 시각화할 차트를 선택합니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>질문 결과 화면에서 <strong>"시각화"</strong> 탭을 클릭합니다</li>
            <li>좌측 사이드바에서 원하는 차트 유형을 선택합니다</li>
            <li>차트 설정을 조정합니다 (축, 색상, 레이블 등)</li>
            <li><strong>"완료"</strong>를 클릭하여 저장합니다</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 mb-3">
            <strong>📊 차트 유형 가이드:</strong>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-1">📈 선 차트</p>
              <p className="text-xs text-gray-600">
                시간에 따른 추세 표시<br />
                <span className="text-green-600">예: 월별 매출</span>
              </p>
            </div>
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-1">📊 막대 차트</p>
              <p className="text-xs text-gray-600">
                카테고리 간 비교<br />
                <span className="text-green-600">예: 상품별 판매량</span>
              </p>
            </div>
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-1">🥧 원형 차트</p>
              <p className="text-xs text-gray-600">
                전체 대비 비율<br />
                <span className="text-green-600">예: 지역별 비중</span>
              </p>
            </div>
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-1">🗺️ 지도</p>
              <p className="text-xs text-gray-600">
                지리적 데이터 표시<br />
                <span className="text-green-600">예: 지역별 매출</span>
              </p>
            </div>
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-1">📋 표</p>
              <p className="text-xs text-gray-600">
                상세 데이터 표시<br />
                <span className="text-green-600">예: 주문 목록</span>
              </p>
            </div>
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-1">🔢 숫자</p>
              <p className="text-xs text-gray-600">
                단일 지표 표시<br />
                <span className="text-green-600">예: 총 매출</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 mb-3">
            <strong>🎨 차트 커스터마이징:</strong>
          </p>
          <ul className="space-y-2 text-sm text-purple-700">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></span>
              <div>
                <strong>축 설정:</strong> X축, Y축 레이블 및 범위 조정
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></span>
              <div>
                <strong>색상:</strong> 차트 색상 테마 변경
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></span>
              <div>
                <strong>레이블:</strong> 데이터 레이블 표시 옵션
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></span>
              <div>
                <strong>범례:</strong> 범례 위치 및 표시 여부
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            <strong>💡 시각화 선택 팁:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            <li>데이터의 특성에 맞는 차트를 선택하세요</li>
            <li>너무 많은 정보를 한 차트에 담지 마세요</li>
            <li>색상은 일관성 있게 사용하세요</li>
            <li>모바일에서도 잘 보이는지 확인하세요</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: '대시보드 생성',
    description: '여러 질문을 모아 대시보드를 만듭니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>6단계:</strong> 대시보드를 생성하고 질문을 추가합니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>홈 화면에서 <strong>"+ 새로 만들기"</strong> → <strong>"대시보드"</strong>를 선택합니다</li>
            <li>대시보드 이름과 설명을 입력합니다</li>
            <li><strong>"카드 추가"</strong> 버튼을 클릭합니다</li>
            <li>추가할 질문(차트)을 선택합니다</li>
            <li>카드의 크기와 위치를 조정합니다</li>
            <li>필요한 만큼 카드를 추가합니다</li>
            <li><strong>"저장"</strong>을 클릭합니다</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 mb-3">
            <strong>✅ 대시보드 구성 예시:</strong>
          </p>
          <div className="space-y-2">
            <div className="bg-white rounded p-3 border border-green-200">
              <p className="font-semibold text-sm text-gray-800 mb-2">📊 영업 대시보드</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 총 매출 (숫자 카드)</li>
                <li>• 월별 매출 추이 (선 차트)</li>
                <li>• 상품 카테고리별 판매 (막대 차트)</li>
                <li>• 지역별 매출 분포 (지도)</li>
                <li>• 최근 주문 목록 (표)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 mb-3">
            <strong>🎛️ 대시보드 고급 기능:</strong>
          </p>
          <div className="space-y-2 text-sm text-purple-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>필터 추가:</strong> 대시보드 전체에 적용되는 필터
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>텍스트 카드:</strong> 설명이나 제목 추가
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>링크 카드:</strong> 관련 대시보드나 외부 링크 연결
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>자동 새로고침:</strong> 주기적으로 데이터 업데이트
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>전체 화면 모드:</strong> 모니터나 TV에 표시
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            <strong>💡 대시보드 디자인 팁:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            <li>가장 중요한 지표를 상단에 배치하세요</li>
            <li>관련된 차트끼리 그룹화하세요</li>
            <li>색상을 일관되게 사용하세요</li>
            <li>너무 많은 정보를 한 화면에 담지 마세요</li>
            <li>모바일에서도 확인해보세요</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: '공유 및 알림 설정',
    description: '대시보드를 공유하고 이메일 알림을 설정합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>7단계:</strong> 대시보드를 공유하고 알림을 설정합니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>대시보드 우측 상단의 <strong>"공유"</strong> 아이콘을 클릭합니다</li>
            <li>공유 방법을 선택합니다:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li><strong>링크 공유:</strong> URL 링크 생성</li>
                <li><strong>이메일 구독:</strong> 정기적으로 이메일 발송</li>
                <li><strong>Slack 연동:</strong> Slack 채널에 자동 발송</li>
              </ul>
            </li>
            <li>공유 대상을 선택하고 권한을 설정합니다</li>
            <li><strong>"완료"</strong>를 클릭합니다</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 mb-3">
            <strong>📧 이메일 구독 설정:</strong>
          </p>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>발송 주기:</strong> 매일, 매주, 매월 중 선택
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>발송 시간:</strong> 원하는 시간대 설정
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>수신자:</strong> 팀원 이메일 추가
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>형식:</strong> PDF 또는 이미지로 첨부
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 mb-3">
            <strong>🔔 알림 설정:</strong>
          </p>
          <p className="text-sm text-purple-700 mb-2">
            특정 조건이 만족되면 알림을 받을 수 있습니다:
          </p>
          <ul className="space-y-1 text-sm text-purple-700">
            <li>• 매출이 목표를 초과했을 때</li>
            <li>• 재고가 일정 수준 이하로 떨어졌을 때</li>
            <li>• 오류율이 임계값을 넘었을 때</li>
            <li>• 일일 주문 수가 급증했을 때</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-lg font-bold text-gray-900">
                완료! 🎉
              </p>
              <p className="text-sm text-gray-600">
                Metabase 대시보드가 성공적으로 생성되었습니다
              </p>
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>다음 단계:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>더 많은 질문을 만들어 대시보드를 확장하세요</li>
              <li>SQL을 배워 더 복잡한 분석을 수행하세요</li>
              <li>팀원들에게 Metabase 사용법을 공유하세요</li>
              <li>정기적으로 대시보드를 검토하고 개선하세요</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            <strong>💡 추가 리소스:</strong>
          </p>
          <div className="space-y-2">
            <a
              href="https://www.metabase.com/docs/latest/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-900"
            >
              <ExternalLink className="h-4 w-4" />
              Metabase 공식 문서
            </a>
            <a
              href="https://www.metabase.com/learn/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-900"
            >
              <ExternalLink className="h-4 w-4" />
              Metabase 학습 가이드
            </a>
            <a
              href="https://discourse.metabase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-900"
            >
              <ExternalLink className="h-4 w-4" />
              Metabase 커뮤니티 포럼
            </a>
          </div>
        </div>
      </div>
    )
  }
]

export function MetabaseGuide({ spreadsheetId, spreadsheetUrl, onBack, onClose }: MetabaseGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">🗄️ Metabase 연결 가이드</h2>
                <p className="text-blue-100 text-sm">
                  단계별로 따라하면서 대시보드를 만들어보세요
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 진행 표시기 */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex-1 h-2 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-white' : 'bg-transparent'
                  }`}
                  style={{
                    width: index === currentStep ? '100%' : index < currentStep ? '100%' : '0%'
                  }}
                />
              </div>
            ))}
          </div>
          <p className="text-white/90 text-sm mt-2">
            단계 {currentStep + 1} / {steps.length}
          </p>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                {currentStep + 1}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {currentStepData.title}
              </h3>
            </div>
            <p className="text-gray-600 ml-13">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-6">
            {typeof currentStepData.content === 'function'
              ? currentStepData.content(spreadsheetId, spreadsheetUrl)
              : currentStepData.content}
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              이전
            </button>

            <div className="text-sm text-gray-600">
              {currentStep + 1} / {steps.length} 단계
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                다음
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <CheckCircle2 className="h-5 w-5" />
                완료
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
