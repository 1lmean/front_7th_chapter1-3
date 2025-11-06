# Chromatic 설정 가이드

## 📚 Chromatic이란?

Chromatic은 Storybook을 위한 시각적 테스트 및 리뷰 플랫폼입니다. UI 컴포넌트의 시각적 변경사항을 자동으로 감지하고 리뷰할 수 있습니다.

## 🚀 설정 방법

### 1. Chromatic 프로젝트 생성

1. [Chromatic 웹사이트](https://www.chromatic.com/)에 접속
2. GitHub 계정으로 로그인
3. "Add project" 클릭
4. 이 저장소 선택
5. 프로젝트 토큰 복사 (예: `chpt_xxxxxxxxxxxxxx`)

### 2. GitHub Secrets 설정

1. GitHub 저장소 페이지로 이동
2. `Settings` > `Secrets and variables` > `Actions` 클릭
3. `New repository secret` 클릭
4. Name: `CHROMATIC_PROJECT_TOKEN`
5. Value: Chromatic에서 복사한 프로젝트 토큰 입력
6. `Add secret` 클릭

### 3. 로컬에서 실행 (선택사항)

```bash
# 환경 변수 설정
export CHROMATIC_PROJECT_TOKEN=your_project_token_here

# Chromatic 실행
pnpm run chromatic
```

## 📦 사용 가능한 명령어

```bash
# Storybook 개발 서버 실행
pnpm run storybook

# Storybook 빌드
pnpm run build-storybook

# Chromatic에 배포 (변경사항이 있어도 종료 코드 0)
pnpm run chromatic

# Chromatic에 배포 (프로젝트 토큰 직접 지정)
pnpm exec chromatic --project-token=<your-token>
```

## 🔄 CI/CD 워크플로우

`.github/workflows/chromatic.yml` 파일이 자동으로 다음을 수행합니다:

- **Push to main/master**: 자동으로 Chromatic에 배포하고 베이스라인 업데이트
- **Pull Request**: 시각적 변경사항을 감지하고 리뷰 요청

## 📊 Chromatic 기능

### 1. Visual Testing
- UI 변경사항 자동 감지
- 픽셀 단위 비교
- 크로스 브라우저 테스트

### 2. UI Review
- PR에서 시각적 변경사항 리뷰
- 팀원과 협업
- 승인/거부 워크플로우

### 3. Component Library
- 모든 컴포넌트의 시각적 히스토리
- 버전별 스냅샷
- 온라인 Storybook 호스팅

## 🎯 워크플로우 예시

1. 새로운 기능 브랜치 생성
2. 컴포넌트 수정 및 스토리 업데이트
3. PR 생성
4. Chromatic이 자동으로 시각적 변경사항 감지
5. 팀원이 Chromatic에서 변경사항 리뷰
6. 승인 후 main 브랜치에 병합
7. main 브랜치의 베이스라인 자동 업데이트

## 🔧 고급 설정

### 특정 브랜치에서만 실행

```yaml
on:
  push:
    branches:
      - main
      - develop
```

### 특정 파일 변경 시에만 실행

```yaml
on:
  push:
    paths:
      - 'src/**/*.tsx'
      - 'src/**/*.stories.tsx'
```

### 자동 승인 설정

```yaml
- name: Publish to Chromatic
  uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    autoAcceptChanges: main  # main 브랜치는 자동 승인
```

## 📝 참고 자료

- [Chromatic 공식 문서](https://www.chromatic.com/docs/)
- [Storybook 공식 문서](https://storybook.js.org/docs)
- [Chromatic GitHub Action](https://github.com/chromaui/action)

## ⚠️ 주의사항

1. **프로젝트 토큰 보안**: 절대 코드에 직접 포함하지 마세요
2. **무료 플랜 제한**: 월 5,000 스냅샷까지 무료
3. **빌드 시간**: 스토리가 많을수록 빌드 시간이 길어집니다

## 🐛 문제 해결

### "Project token is required" 오류
- GitHub Secrets에 `CHROMATIC_PROJECT_TOKEN`이 올바르게 설정되었는지 확인

### 빌드 실패
```bash
# 로컬에서 Storybook 빌드 테스트
pnpm run build-storybook
```

### 스냅샷 차이가 너무 많이 발생
- 폰트, 이미지 등 외부 리소스 로딩 확인
- 애니메이션 비활성화 고려
- 특정 스토리 제외 설정

