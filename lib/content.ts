import type { Course } from "./course"
import { normalizeAnswer, type Blank, type Mistake } from "./grade"

export type Question = {
  id: string
  stage: number
  startLine: number
  prompt: string
  template: string
  blanks: Blank[]
  why: string
}

export type Stage = {
  id: number
  title: string
  blurb: string
}

export type Trap = {
  id: string
  ask: string
  choices: string[]
  answer: string
  why: string
}

export type StudyLine = {
  code: string
  say: string
  trap?: string
}

export type GlossaryItem = {
  term: string
  say: string
  write: string
}

export type SheetSection = {
  id: string
  title: string
  startLine: number
  template: string
  blanks: Blank[]
}

export function eq(answer: string, message: string): Mistake {
  return {
    test: (value) => value === normalizeAnswer(answer),
    message,
  }
}

export function blank(
  id: string,
  label: string,
  answer: string,
  hint: string,
  extra?: { accept?: string[]; mistakes?: Mistake[] },
): Blank {
  return {
    id,
    label,
    answer,
    hint,
    accept: extra?.accept,
    mistakes: extra?.mistakes,
  }
}

export const stages: Stage[] = [
  {
    id: 1,
    title: "표 불러오기",
    blurb: "pandas로 jeans.csv를 읽고, 맨 위가 맞는지 확인한다.",
  },
  {
    id: 2,
    title: "목과 허리",
    blurb: "목둘레는 입력 X, 허리둘레는 맞혀야 하는 정답 y.",
  },
  {
    id: 3,
    title: "학습과 시험",
    blurb: "데이터를 70%와 30%로 나눈다. 받는 순서를 외워야 한다.",
  },
  {
    id: 4,
    title: "직선 긋기",
    blurb: "LinearRegression을 만들고, 학습 데이터로 fit 한다.",
  },
  {
    id: 5,
    title: "점수와 예측",
    blurb: "기울기, 채점, 예측. 밑줄 있는 이름과 없는 이름을 가른다.",
  },
  {
    id: 6,
    title: "그래프",
    blurb: "실제 값은 파란 점, 예측은 빨간 선.",
  },
]

export const questions: Question[] = [
  {
    id: "import-pandas",
    stage: 1,
    startLine: 1,
    prompt:
      "표(엑셀처럼 행과 열이 있는 데이터)를 다루는 라이브러리를 불러온다. 긴 이름 대신 짧은 별명으로 쓴다.",
    template: "import {{lib}} as {{alias}}",
    blanks: [
      blank("lib", "라이브러리 이름", "pandas", "동물 이름에 s가 붙는다. 전부 소문자.", {
        mistakes: [
          eq("pd", "pd는 별명이다. 라이브러리 이름은 pandas."),
          eq("panda", "끝에 s. pandas."),
          eq("numpy", "숫자 배열은 다음 단계. 표를 읽는 쪽은 pandas."),
        ],
      }),
      blank("alias", "짧은 별명", "pd", "두 글자. 전부 소문자.", {
        mistakes: [
          eq("pandas", "pandas는 왼쪽 이름. 별명은 pd."),
          eq("np", "np는 numpy 별명. pandas 별명은 pd."),
        ],
      }),
    ],
    why: "pandas가 표 라이브러리고, as pd 덕분에 앞으로는 pd.함수()처럼 짧게 쓴다.",
  },
  {
    id: "read-csv",
    stage: 1,
    startLine: 2,
    prompt:
      "청바지 치수가 들어 있는 csv 파일을 읽어서, df라는 표로 만든다.",
    template: "df = pd.{{method}}({{file}})",
    blanks: [
      blank("method", "파일을 읽는 함수", "read_csv", "읽다(read) + 밑줄 + csv.", {
        mistakes: [
          eq("read_excel", "이 파일은 엑셀이 아니라 csv. read_csv."),
          eq("to_csv", "to_csv는 저장이다. 읽는 함수는 read_csv."),
          eq("open", "그냥 열기가 아니라 표로 읽는 함수. read_csv."),
          eq("read", "형식이 csv라는 것까지 적는다. read_csv."),
        ],
      }),
      blank("file", "파일 이름", "'jeans.csv'", "확장자까지, 따옴표로 감싼다.", {
        accept: ['"jeans.csv"'],
        mistakes: [
          eq("jeans.csv", "문자열이라 따옴표가 필요해. 'jeans.csv'"),
          eq("jeans", "확장자와 따옴표까지. 'jeans.csv'"),
          eq("'waist.csv'", "파일 이름은 jeans.csv."),
          eq("'neck.csv'", "파일 이름은 jeans.csv."),
        ],
      }),
    ],
    why: "pd.read_csv('jeans.csv')가 파일을 표로 읽어 df에 넣는다. df는 dataframe, 즉 표라는 뜻으로 자주 쓰는 이름이다.",
  },
  {
    id: "head",
    stage: 1,
    startLine: 3,
    prompt: "표가 잘 읽혔는지 맨 위만 슬쩍 본다. 기본은 5줄이고, 괄호 안은 비어 있다.",
    template: "df.{{method}}()",
    blanks: [
      blank("method", "맨 위를 보는 함수", "head", "머리. 맨 위.", {
        mistakes: [
          eq("tail", "tail은 맨 아래다. 맨 위는 head."),
          eq("head(5)", "5는 기본값이라 생략한다. 칸에는 head만."),
          eq("columns", "열 이름이 아니라 위쪽 행을 본다. head."),
          eq("info", "정보 요약이 아니라 맨 위 5줄. head."),
        ],
      }),
    ],
    why: "df.head()는 맨 위 5줄을 보여 준다. 괄호를 빼면 실행되지 않고 함수 자체만 나온다.",
  },
  {
    id: "import-numpy",
    stage: 2,
    startLine: 5,
    prompt:
      "숫자 배열 라이브러리를 불러온다. 이 수행 코드에서는 바로 뒤에서 pandas 열을 쓰지만, import 줄이 시험에 그대로 나온다.",
    template: "import {{lib}} as {{alias}}",
    blanks: [
      blank("lib", "라이브러리 이름", "numpy", "넘파이. 전부 소문자.", {
        mistakes: [
          eq("np", "np는 별명. 라이브러리 이름은 numpy."),
          eq("pandas", "pandas는 이미 위에서 불렀다. 이 줄은 numpy."),
          eq("numpi", "철자는 numpy."),
        ],
      }),
      blank("alias", "짧은 별명", "np", "두 글자.", {
        mistakes: [
          eq("numpy", "numpy는 왼쪽 이름. 별명은 np."),
          eq("pd", "pd는 pandas 별명. numpy 별명은 np."),
        ],
      }),
    ],
    why: "import numpy as np. 별명 np로 숫자 배열을 다룬다.",
  },
  {
    id: "x-column",
    stage: 2,
    startLine: 6,
    prompt:
      "입력 X는 목둘레다. 표의 한 열을 골라 숫자 배열로 꺼낸다. 허리는 아직 아니다.",
    template: "X = df[{{col}}].{{values}}.reshape(-1,1)",
    blanks: [
      blank("col", "입력으로 쓸 열", "'neck'", "목둘레. 따옴표 필요.", {
        accept: ['"neck"'],
        mistakes: [
          eq("'waist'", "허리는 정답 y다. 입력 X는 목둘레 'neck'."),
          eq("waist", "허리는 정답 y다. 입력은 목둘레 neck이고, 따옴표가 필요해."),
          eq("neck", "열 이름은 문자라서 따옴표가 필요해. 'neck'"),
          eq("df['neck']", "df와 대괄호는 이미 있다. 안에는 'neck'만."),
        ],
      }),
      blank("values", "열을 배열로 꺼내는 속성", "values", "복수형. 괄호 없는 이름.", {
        mistakes: [
          eq("value", "복수형 values."),
          eq("values()", "이 코드에서는 괄호 없이 values."),
          eq("to_numpy", "이 코드는 values."),
          eq("reshape", "reshape는 바로 뒤에서 한다. 여기는 values."),
        ],
      }),
    ],
    why: "df['neck'].values 가 목둘레 숫자를 배열로 꺼낸다. X는 모델에게 보여 주는 문제, 즉 특징이다.",
  },
  {
    id: "x-reshape",
    stage: 2,
    startLine: 6,
    prompt:
      "사이킷런은 입력을 세로로 긴 2차원으로 받는다. 행 개수는 알아서 세고, 열은 목둘레 하나뿐이다.",
    template: "X = df['neck'].values.{{method}}({{shape}})",
    blanks: [
      blank("method", "모양을 바꾸는 함수", "reshape", "shape 앞에 re가 붙는다.", {
        mistakes: [
          eq("shape", "shape는 크기를 조회만 한다. 바꾸는 함수는 reshape."),
          eq("resize", "이 코드의 함수는 reshape."),
          eq("-1,1", "그 숫자는 괄호 안 칸이다. 함수 이름은 reshape."),
        ],
      }),
      blank("shape", "행, 열", "-1, 1", "행은 자동(-1), 열은 1개.", {
        accept: ["-1,1", "-1, 1"],
        mistakes: [
          eq("(-1,1)", "괄호는 코드에 이미 있다. 안에는 -1, 1만."),
          eq("(-1, 1)", "괄호는 밖에 있다. 안에는 -1, 1만."),
          eq("-1", "열 개수까지 써야 한다. -1, 1"),
          eq("1,-1", "순서가 반대다. 행 -1, 열 1."),
          eq("-1,0", "열은 1개다. 목둘레라는 특성이 하나라서 -1, 1"),
        ],
      }),
    ],
    why: "reshape(-1, 1)에서 -1은 '행은 데이터 수대로', 1은 '열은 하나'. 목이 몇 명이든 특성은 목둘레 한 칸이다.",
  },
  {
    id: "y-column",
    stage: 2,
    startLine: 7,
    prompt:
      "모델이 맞혀야 하는 정답 y는 허리둘레다. X와 달리 reshape는 하지 않는다.",
    template: "y = df[{{col}}].values",
    blanks: [
      blank("col", "정답 열", "'waist'", "허리둘레. 따옴표 필요.", {
        accept: ['"waist"'],
        mistakes: [
          eq("'neck'", "목은 입력 X다. 정답 y는 'waist'."),
          eq("neck", "목은 입력 X다. 정답 열은 waist이고, 따옴표가 필요해."),
          eq("waist", "따옴표로 감싼다. 'waist'"),
          eq("reshape(-1,1)", "y에는 reshape를 붙이지 않는다. 열 이름만."),
        ],
      }),
    ],
    why: "y = df['waist'].values. 허리는 정답(레이블)이라 1차원 그대로 둔다. reshape는 입력 X에만 했다.",
  },
  {
    id: "import-split",
    stage: 3,
    startLine: 9,
    prompt: "데이터를 학습용과 시험용으로 나누는 함수를 불러온다. 직선 모델이 들어 있는 모듈과 헷갈리지 말 것.",
    template: "from sklearn.{{module}} import {{func}}",
    blanks: [
      blank("module", "모듈 이름", "model_selection", "데이터를 나누는 도구가 있는 모듈.", {
        mistakes: [
          eq("linear_model", "linear_model은 LinearRegression이 있는 곳. 나누기는 model_selection."),
          eq("model_selection.split", "모듈 이름만. model_selection."),
          eq("train_test_split", "그건 함수 이름이라 오른쪽 칸이다. 모듈은 model_selection."),
        ],
      }),
      blank("func", "나누는 함수", "train_test_split", "train, test, split이 밑줄로 이어진다.", {
        mistakes: [
          eq("model_selection", "그건 왼쪽 모듈. 함수는 train_test_split."),
          eq("train_test", "끝이 split까지. train_test_split."),
          eq("split", "전체 이름은 train_test_split."),
          eq("LinearRegression", "직선 모델은 다음 단계. 여기는 나누는 함수."),
        ],
      }),
    ],
    why: "from sklearn.model_selection import train_test_split. 모델을 '고르는' 모듈에서 데이터를 자르는 함수를 꺼낸다.",
  },
  {
    id: "unpack",
    stage: 3,
    startLine: 10,
    prompt:
      "함수가 네 덩어리를 돌려준다. 받는 변수 순서가 정해져 있다. X 두 개, 그다음 y 두 개. 각 쌍은 train이 test보다 먼저.",
    template: `{{left}} = train_test_split(
    X, y, test_size=0.3, random_state=42)`,
    blanks: [
      blank(
        "left",
        "받는 변수 네 개",
        "X_train, X_test, y_train, y_test",
        "X_train, X_test, y_train, y_test",
        {
          mistakes: [
            {
              test: (value) => {
                const parts = value.split(",")
                const want = ["X_train", "X_test", "y_train", "y_test"]
                return (
                  parts.length === 4 &&
                  want.every((item) => parts.includes(item)) &&
                  value !== want.join(",")
                )
              },
              message:
                "이름은 다 있다. 순서가 다르다. X_train, X_test, y_train, y_test.",
            },
            eq(
              "y_train,y_test,X_train,X_test",
              "y가 먼저가 아니다. X 두 개 다음에 y 두 개.",
            ),
            eq(
              "X_test,X_train,y_test,y_train",
              "test가 먼저가 아니다. train 다음에 test.",
            ),
          ],
        },
      ),
    ],
    why: "순서는 항상 X_train, X_test, y_train, y_test. X가 y보다 먼저고, 같은 종류에서는 train이 test보다 먼저다.",
  },
  {
    id: "split-args",
    stage: 3,
    startLine: 11,
    prompt:
      "시험에 쓸 비율은 30%다. 나머지가 학습이다. 섞는 규칙은 42로 고정해서, 다시 실행해도 같은 나눔이 나오게 한다.",
    template: `X_train, X_test, y_train, y_test = train_test_split(
    X, y, {{size}}, {{seed}})`,
    blanks: [
      blank("size", "시험 비율", "test_size=0.3", "이름=소수. 30%는 0.3.", {
        accept: ["test_size=0.30", "test_size = 0.3"],
        mistakes: [
          eq("train_size=0.3", "0.3은 시험 비율이다. 이름은 test_size. 학습은 70%."),
          eq("test_size=0.7", "시험은 30%다. test_size=0.3."),
          eq("test_size=30", "1을 100%로 보는 소수다. 30%는 0.3."),
          eq("0.3", "이름까지 같이 쓴다. test_size=0.3"),
          eq("test_size=0.3,", "쉼표는 적지 않는다. test_size=0.3"),
        ],
      }),
      blank("seed", "섞는 규칙", "random_state=42", "랜덤 시드. 이 코드의 숫자는 42.", {
        accept: ["random_state = 42"],
        mistakes: [
          eq("seed=42", "매개변수 이름은 random_state."),
          eq("random=42", "random_state=42."),
          eq("random_state=0", "이 코드의 씨앗은 42."),
          eq("42", "이름까지. random_state=42"),
          eq("random_state=42,", "쉼표 없이 random_state=42"),
        ],
      }),
    ],
    why: "test_size=0.3이면 테스트 30%, 학습 70%. random_state=42는 섞기 규칙이라, 친구와 결과가 같아진다.",
  },
  {
    id: "import-lr",
    stage: 4,
    startLine: 15,
    prompt: "직선으로 예측하는 모델 클래스를 불러온다. 데이터를 나누던 모듈이 아니다.",
    template: "from sklearn.{{module}} import {{cls}}",
    blanks: [
      blank("module", "모듈 이름", "linear_model", "linear와 model 사이는 밑줄.", {
        mistakes: [
          eq("model_selection", "model_selection은 나누기. 직선 모델은 linear_model."),
          eq("linearmodel", "사이에 밑줄. linear_model."),
          eq("LinearRegression", "그건 클래스 이름이라 오른쪽이다. 모듈은 linear_model."),
        ],
      }),
      blank("cls", "클래스 이름", "LinearRegression", "Linear와 Regression, 앞글자가 둘 다 대문자.", {
        mistakes: [
          eq("linear_model", "그건 왼쪽 모듈. 클래스는 LinearRegression."),
          eq("linear_regression", "밑줄로 잇지 않는다. LinearRegression."),
          eq("linearregression", "Linear와 Regression, 두 단어의 앞글자를 대문자로."),
          eq("Regression", "LinearRegression 전체."),
        ],
      }),
    ],
    why: "from sklearn.linear_model import LinearRegression. 선형회귀, 즉 점들 사이를 지나는 직선을 찾는 모델이다.",
  },
  {
    id: "construct-lr",
    stage: 4,
    startLine: 16,
    prompt: "방금 불러온 클래스로 빈 모델을 만든다. 괄호 안은 비어 있다.",
    template: "model = {{cls}}()",
    blanks: [
      blank("cls", "클래스 이름", "LinearRegression", "불러온 이름 그대로.", {
        mistakes: [
          eq("linear_model", "모듈이 아니라 클래스. LinearRegression."),
          eq("LinearRegression()", "괄호는 코드에 있다. 이름만."),
          eq("model", "변수 이름은 이미 model. 오른쪽은 LinearRegression."),
        ],
      }),
    ],
    why: "model = LinearRegression()은 아직 아무것도 모르는 빈 직선이다. 학습 전이라 기울기가 없다.",
  },
  {
    id: "fit",
    stage: 4,
    startLine: 17,
    prompt:
      "학습용 목둘레와 학습용 허리둘레로 직선을 맞춘다. 시험 데이터는 아직 보여 주면 안 된다.",
    template: "model.{{method}}({{x}}, {{y}})",
    blanks: [
      blank("method", "학습 함수", "fit", "맞추다. 세 글자.", {
        mistakes: [
          eq("predict", "predict는 예측. 직선을 맞추는 학습은 fit."),
          eq("score", "score는 채점. 학습은 fit."),
          eq("train", "함수 이름은 train이 아니라 fit."),
        ],
      }),
      blank("x", "학습용 입력", "X_train", "목둘레 학습분. X는 대문자.", {
        mistakes: [
          eq("X_test", "시험 문제로 학습하면 안 된다. X_train."),
          eq("y_train", "첫 칸은 입력 X. y는 다음 칸."),
          eq("x_train", "X는 대문자. X_train."),
          eq("X", "나눈 뒤의 학습분. X_train."),
        ],
      }),
      blank("y", "학습용 정답", "y_train", "허리둘레 학습분.", {
        mistakes: [
          eq("y_test", "정답도 학습용이다. y_train."),
          eq("X_train", "입력은 앞 칸. 여기는 정답 y_train."),
          eq("Y_train", "y는 소문자. y_train."),
        ],
      }),
    ],
    why: "model.fit(X_train, y_train). 학습 문제로 직선을 맞춘다. 시험 데이터로 fit 하면 정답을 미리 본 셈이다.",
  },
  {
    id: "coef",
    stage: 5,
    startLine: 19,
    prompt:
      "학습이 끝난 직선의 기울기와 y절편을 출력한다. 둘 다 이름 끝에 밑줄이 있다. 기울기가 먼저다.",
    template: "print(model.{{coef}}, model.{{intercept}})",
    blanks: [
      blank("coef", "기울기", "coef_", "coefficient의 줄임. 끝에 밑줄.", {
        mistakes: [
          eq("intercept_", "절편은 다음 칸. 기울기가 먼저고, 이름은 coef_."),
          eq("coefficient", "줄여서 coef_ . 끝에 밑줄."),
          eq("slope", "코드 이름은 coef_."),
          eq("coef", "끝에 밑줄. coef_"),
        ],
      }),
      blank("intercept", "y절편", "intercept_", "절편. 끝에 밑줄.", {
        mistakes: [
          eq("coef_", "기울기는 앞 칸. 여기는 intercept_."),
          eq("intercept", "끝에 밑줄. intercept_"),
          eq("bias", "이 코드의 이름은 intercept_."),
        ],
      }),
    ],
    why: "coef_는 목이 1 늘 때 허리가 얼마나 늘지(기울기), intercept_는 목둘레가 0일 때의 허리(y절편)다. 밑줄은 '학습이 끝난 뒤에 생기는 값'이라는 표시다.",
  },
  {
    id: "score-train",
    stage: 5,
    startLine: 21,
    prompt:
      "학습 데이터를 얼마나 잘 설명하는지 점수를 낸다. 1에 가까울수록 잘 맞는다. 이 줄은 학습용이다.",
    template: "print(model.{{method}}({{x}}, {{y}}))",
    blanks: [
      blank("method", "점수 함수", "score", "채점. 밑줄 없음.", {
        mistakes: [
          eq("predict", "값을 뽑는 건 predict. 점수는 score."),
          eq("fit", "fit은 이미 끝난 학습. 점수는 score."),
          eq("score_", "score에는 밑줄이 없다. coef_만 밑줄이 있다."),
        ],
      }),
      blank("x", "학습용 입력", "X_train", "이 줄은 학습 점수.", {
        mistakes: [
          eq("X_test", "시험 점수는 다음 줄. 여기는 X_train."),
          eq("y_train", "첫 칸은 입력 X_train."),
        ],
      }),
      blank("y", "학습용 정답", "y_train", "학습용 허리.", {
        mistakes: [
          eq("y_test", "이 줄은 학습 점수. y_train."),
          eq("X_train", "정답 칸이다. y_train."),
        ],
      }),
    ],
    why: "model.score(X_train, y_train)은 학습 점수, 결정계수 R²다. 1이면 점들이 직선 위에 거의 다 올라간 것이다.",
  },
  {
    id: "score-test",
    stage: 5,
    startLine: 23,
    prompt: "이번엔 시험 점수. 학습에 안 쓴 목둘레로 허리를 얼마나 맞혔는지다. 함수 이름은 위와 같다.",
    template: "print(model.{{method}}({{x}}, {{y}}))",
    blanks: [
      blank("method", "점수 함수", "score", "학습 점수와 같은 함수.", {
        mistakes: [
          eq("predict", "점수는 score."),
          eq("fit", "시험 데이터로 fit 하지 않는다. score."),
        ],
      }),
      blank("x", "시험용 입력", "X_test", "학습에 안 쓴 목둘레.", {
        mistakes: [
          eq("X_train", "이 줄은 시험 점수. X_test."),
          eq("y_test", "첫 칸은 입력 X_test."),
        ],
      }),
      blank("y", "시험용 정답", "y_test", "학습에 안 쓴 허리.", {
        mistakes: [
          eq("y_train", "이 줄은 시험 점수. y_test."),
          eq("X_test", "정답 칸이다. y_test."),
        ],
      }),
    ],
    why: "학습 점수는 외운 점수, 테스트 점수는 실전 점수다. 함수는 둘 다 score이고, 데이터만 train에서 test로 바뀐다.",
  },
  {
    id: "predict",
    stage: 5,
    startLine: 25,
    prompt: "시험용 목둘레만 보고 허리둘레를 예측한다. 정답 y는 넣지 않는다.",
    template: `predictions = model.{{method}}({{x}})
print("예측값:", predictions[:5])`,
    blanks: [
      blank("method", "예측 함수", "predict", "예측하다. 밑줄 없음.", {
        mistakes: [
          eq("fit", "fit은 학습이다. 예측은 predict."),
          eq("score", "score는 점수만 준다. 허리 값을 뽑는 건 predict."),
          eq("predict_", "predict에는 밑줄이 없다."),
        ],
      }),
      blank("x", "시험용 입력만", "X_test", "문제만. 정답은 넣지 않는다.", {
        mistakes: [
          eq("y_test", "정답을 넣으면 컨닝이다. 목둘레 X_test만."),
          eq("X_train", "이미 학습에 쓴 문제가 아니다. 시험 문제 X_test."),
          eq("X_test,y_test", "예측은 X만 넣는다. y_test는 빼."),
          eq("X", "나눈 시험분. X_test."),
        ],
      }),
    ],
    why: "model.predict(X_test)는 목둘레만 보고 허리를 추측한다. 돌아온 값이 predictions다.",
  },
  {
    id: "preview-slice",
    stage: 5,
    startLine: 26,
    prompt: "예측과 실제 허리를 앞에서 5개만 나란히 출력해 비교한다. 두 칸은 같다.",
    template: `print("예측값:", predictions[{{left}}])
print("테스트 결괏값: ", y_test[{{right}}])`,
    blanks: [
      blank("left", "예측 5개", ":5", "콜론 뒤에 5. 처음부터 5개.", {
        accept: ["0:5"],
        mistakes: [
          eq("5", "그냥 5가 아니라 :5. 처음부터 5개."),
          eq("1:5", "0번부터다. 앞을 비운 :5."),
          eq("[:5]", "대괄호는 코드에 있다. 안에는 :5"),
          eq(":5]", "대괄호 없이 :5"),
        ],
      }),
      blank("right", "정답 5개", ":5", "왼쪽과 같다.", {
        accept: ["0:5"],
        mistakes: [
          eq("5", ":5 로 쓴다."),
          eq("1:5", "처음부터면 :5."),
        ],
      }),
    ],
    why: "[:5]는 0번부터 5개, 즉 맨 앞 다섯 개다. 0:5와 같은 뜻이고, 이 코드는 :5로 적혀 있다.",
  },
  {
    id: "import-plt",
    stage: 6,
    startLine: 29,
    prompt: "그래프 도구를 짧은 별명으로 불러온다.",
    template: "import matplotlib.pyplot as {{alias}}",
    blanks: [
      blank("alias", "그래프 별명", "plt", "plot의 줄임. 세 글자.", {
        mistakes: [
          eq("pyplot", "pyplot는 앞에 이미 있다. 별명은 plt."),
          eq("plot", "별명은 plt. plot은 선을 그릴 때 쓰는 함수."),
          eq("pd", "pd는 pandas. 그래프 별명은 plt."),
          eq("matplotlib", "긴 이름 말고 별명 plt."),
        ],
      }),
    ],
    why: "import matplotlib.pyplot as plt. 이제 그래프는 plt.함수()로 그린다.",
  },
  {
    id: "scatter",
    stage: 6,
    startLine: 30,
    prompt: "시험 데이터의 실제 목둘레·허리둘레를 점으로 찍는다. 실제 값은 파란색.",
    template: "plt.{{method}}(X_test, y_test, color={{color}})",
    blanks: [
      blank("method", "점을 찍는 함수", "scatter", "흩뿌리다. 선이 아니다.", {
        mistakes: [
          eq("plot", "plot은 선이다. 실제 데이터 점은 scatter."),
          eq("show", "show는 맨 마지막에 화면을 띄운다."),
          eq("bar", "막대가 아니라 점. scatter."),
        ],
      }),
      blank("color", "점 색", "'blue'", "실제 값은 파랑.", {
        accept: ['"blue"'],
        mistakes: [
          eq("'red'", "빨간색은 예측 선이다. 실제 점은 'blue'."),
          eq("blue", "따옴표로 감싼다. 'blue'"),
          eq("red", "점은 파랑. 'blue'"),
        ],
      }),
    ],
    why: "plt.scatter(X_test, y_test, color='blue')는 시험 데이터의 실제 좌표를 파란 점으로 찍는다.",
  },
  {
    id: "plot-line",
    stage: 6,
    startLine: 31,
    prompt: "모델이 예측한 허리를 선으로 얹는다. 예측은 빨간색.",
    template: "plt.{{method}}(X_test, predictions, color={{color}})",
    blanks: [
      blank("method", "선을 그리는 함수", "plot", "선. 점이 아니다.", {
        mistakes: [
          eq("scatter", "scatter는 점이다. 예측 선은 plot."),
          eq("line", "함수 이름은 plot."),
          eq("show", "show는 마지막 줄."),
        ],
      }),
      blank("color", "선 색", "'red'", "예측은 빨강.", {
        accept: ['"red"'],
        mistakes: [
          eq("'blue'", "파란색은 실제 점이다. 예측 선은 'red'."),
          eq("red", "따옴표로 감싼다. 'red'"),
          eq("blue", "선은 빨강. 'red'"),
        ],
      }),
    ],
    why: "plt.plot(X_test, predictions, color='red')가 예측값을 빨간 선으로 잇는다. 파란 점 위를 빨간 선이 지나면 잘 맞춘 것이다.",
  },
  {
    id: "axes-show",
    stage: 6,
    startLine: 32,
    prompt: "가로축은 목, 세로축은 허리라고 적고, 그래프를 화면에 띄운다. 축 제목 글자는 코드에 이미 있다.",
    template: `plt.{{xlabel}}('neck')
plt.{{ylabel}}('waist')
plt.{{show}}()`,
    blanks: [
      blank("xlabel", "가로축 이름 함수", "xlabel", "x축 label.", {
        mistakes: [
          eq("ylabel", "세로는 다음 줄. 가로는 xlabel."),
          eq("xlable", "철자는 xlabel."),
          eq("set_xlabel", "여기서는 xlabel."),
        ],
      }),
      blank("ylabel", "세로축 이름 함수", "ylabel", "y축 label.", {
        mistakes: [
          eq("xlabel", "가로는 윗줄. 세로는 ylabel."),
          eq("ylable", "철자는 ylabel."),
        ],
      }),
      blank("show", "화면 출력", "show", "보여 주다. 괄호는 비어 있다.", {
        mistakes: [
          eq("show()", "괄호는 코드에 있다. show만."),
          eq("display", "이 코드의 함수는 show."),
          eq("plot", "plot은 이미 선을 그렸다. 화면은 show."),
        ],
      }),
    ],
    why: "xlabel('neck'), ylabel('waist'), show(). 가로가 목, 세로가 허리인 이유가 여기 있다. X가 neck, y가 waist.",
  },
]

export const studyLines: StudyLine[] = [
  {
    code: "import pandas as pd",
    say: "표 라이브러리 pandas를 pd라는 별명으로 불러온다.",
    trap: "끝에 s. 별명은 소문자 pd.",
  },
  {
    code: "df = pd.read_csv('jeans.csv')",
    say: "청바지 치수 파일을 읽어 표 df로 만든다.",
    trap: "read_csv 에 밑줄. 파일 이름은 따옴표.",
  },
  {
    code: "df.head()",
    say: "맨 위 5줄만 봐서 잘 읽혔는지 확인한다.",
    trap: "맨 아래는 tail. 괄호는 비운다.",
  },
  { code: "", say: "" },
  {
    code: "import numpy as np",
    say: "숫자 배열 라이브러리. 별명은 np.",
    trap: "pandas 별명 pd와 바꾸지 말 것.",
  },
  {
    code: "X = df['neck'].values.reshape(-1,1)",
    say: "입력 X는 목둘레. 배열로 꺼낸 뒤, 행은 자동·열은 1개인 모양으로 바꾼다.",
    trap: "reshape는 X에만. -1이 행, 1이 열.",
  },
  {
    code: "y = df['waist'].values",
    say: "정답 y는 허리둘레. reshape 하지 않는다.",
    trap: "neck과 waist를 바꾸면 문제가 뒤집어진다.",
  },
  { code: "", say: "" },
  {
    code: "from sklearn.model_selection import train_test_split",
    say: "학습용과 시험용으로 나누는 함수를 불러온다.",
    trap: "LinearRegression은 여기가 아니라 linear_model에 있다.",
  },
  {
    code: "X_train, X_test, y_train, y_test = train_test_split(",
    say: "받는 순서. X 두 개(train, test), 그다음 y 두 개(train, test).",
    trap: "test를 train보다 앞에 두지 않는다.",
  },
  {
    code: "    X, y, test_size=0.3, random_state=42)",
    say: "시험 30%, 학습 70%. 42는 섞는 규칙을 고정하는 씨앗.",
    trap: "0.3을 학습 비율로 착각하지 말 것.",
  },
  {
    code: "print(X_train.shape, X_test.shape, y_train.shape,",
    say: "네 덩어리의 크기를 출력해 잘 나뉘었는지 본다.",
  },
  {
    code: "      y_test.shape)",
    say: "출력이 다음 줄로 이어진 것뿐이다. 새 명령이 아니다.",
  },
  { code: "", say: "" },
  {
    code: "from sklearn.linear_model import LinearRegression",
    say: "직선 모델 클래스를 불러온다.",
    trap: "L과 R이 대문자. 밑줄로 쓰지 않는다.",
  },
  {
    code: "model = LinearRegression()",
    say: "빈 모델을 만든다. 아직 기울기는 없다.",
  },
  {
    code: "model.fit(X_train, y_train)",
    say: "학습용 목과 허리로 직선을 맞춘다.",
    trap: "fit에 test를 넣지 않는다.",
  },
  { code: "", say: "" },
  {
    code: "print(model.coef_, model.intercept_)",
    say: "기울기와 y절편. 학습이 끝난 뒤에 생기는 값이라 밑줄이 있다.",
    trap: "score, fit, predict에는 밑줄이 없다.",
  },
  { code: "", say: "" },
  {
    code: "print(model.score(X_train, y_train))",
    say: "학습 점수. 1에 가까울수록 직선을 잘 따른다.",
  },
  { code: "", say: "" },
  {
    code: "print(model.score(X_test, y_test))",
    say: "시험 점수. 학습에 안 쓴 데이터로 채점한다.",
    trap: "위 줄과 함수는 같고 데이터만 test.",
  },
  { code: "", say: "" },
  {
    code: "predictions = model.predict(X_test)",
    say: "시험 목둘레만 보고 허리를 예측한다.",
    trap: "괄호 안에 y_test를 넣지 않는다.",
  },
  {
    code: 'print("예측값:", predictions[:5])',
    say: "예측 다섯 개만 출력한다.",
    trap: ":5 는 처음부터 5개.",
  },
  {
    code: 'print("테스트 결괏값: ", y_test[:5])',
    say: "실제 허리 다섯 개. 예측과 나란히 비교한다.",
  },
  { code: "", say: "" },
  {
    code: "import matplotlib.pyplot as plt",
    say: "그래프 도구. 별명 plt.",
  },
  {
    code: "plt.scatter(X_test, y_test, color='blue')",
    say: "실제 시험 데이터를 파란 점으로 찍는다.",
    trap: "점은 scatter, 파랑은 실제.",
  },
  {
    code: "plt.plot(X_test, predictions, color='red')",
    say: "예측값을 빨간 선으로 잇는다.",
    trap: "선은 plot, 빨강은 예측.",
  },
  {
    code: "plt.xlabel('neck')",
    say: "가로축 제목은 목둘레.",
  },
  {
    code: "plt.ylabel('waist')",
    say: "세로축 제목은 허리둘레.",
  },
  {
    code: "plt.show()",
    say: "그래프를 화면에 띄운다.",
  },
]

export const glossary: GlossaryItem[] = [
  { term: "pandas / pd", say: "표를 다루는 라이브러리와 그 별명.", write: "import pandas as pd" },
  { term: "read_csv", say: "csv 파일을 표로 읽는다.", write: "pd.read_csv('jeans.csv')" },
  { term: "df", say: "읽어 온 표. dataframe의 줄임으로 습관처럼 쓴다.", write: "df = pd.read_csv(...)" },
  { term: "head", say: "표의 맨 위 5줄.", write: "df.head()" },
  { term: "numpy / np", say: "숫자 배열 라이브러리와 별명.", write: "import numpy as np" },
  { term: "X / neck", say: "입력, 특징. 목둘레를 보고 맞힌다.", write: "df['neck']" },
  { term: "y / waist", say: "정답, 레이블. 맞혀야 하는 허리둘레.", write: "df['waist']" },
  { term: "values", say: "표의 한 열을 숫자 배열로 꺼낸다.", write: ".values" },
  { term: "reshape(-1, 1)", say: "입력을 세로 한 줄로. -1은 행 자동, 1은 열 하나.", write: ".reshape(-1,1)" },
  { term: "model_selection", say: "데이터를 나누는 도구가 있는 모듈.", write: "sklearn.model_selection" },
  { term: "train_test_split", say: "학습용과 시험용으로 자른다.", write: "train_test_split(...)" },
  { term: "받는 순서", say: "X 두 개 다음 y 두 개. train이 test보다 먼저.", write: "X_train, X_test, y_train, y_test" },
  { term: "test_size=0.3", say: "시험 30%. 학습은 나머지 70%.", write: "test_size=0.3" },
  { term: "random_state=42", say: "섞기 규칙. 같은 숫자면 다시 돌려도 같다.", write: "random_state=42" },
  { term: "linear_model", say: "직선 모델이 들어 있는 모듈.", write: "sklearn.linear_model" },
  { term: "LinearRegression", say: "선형회귀 클래스. 두 단어 다 대문자로 시작.", write: "LinearRegression()" },
  { term: "fit", say: "학습. 직선을 맞춘다.", write: "model.fit(X_train, y_train)" },
  { term: "coef_", say: "기울기. 끝에 밑줄.", write: "model.coef_" },
  { term: "intercept_", say: "y절편. 끝에 밑줄.", write: "model.intercept_" },
  { term: "score", say: "결정계수. 1에 가까울수록 잘 맞음. 밑줄 없음.", write: "model.score(X, y)" },
  { term: "predict", say: "예측. 문제 X만 넣는다.", write: "model.predict(X_test)" },
  { term: ":5", say: "처음부터 5개.", write: "predictions[:5]" },
  { term: "plt", say: "그래프 별명.", write: "import matplotlib.pyplot as plt" },
  { term: "scatter / blue", say: "실제 데이터를 파란 점으로.", write: "plt.scatter(..., color='blue')" },
  { term: "plot / red", say: "예측을 빨간 선으로.", write: "plt.plot(..., color='red')" },
  { term: "xlabel / ylabel / show", say: "가로 제목, 세로 제목, 화면 출력.", write: "plt.show()" },
]

export const traps: Trap[] = [
  {
    id: "x-col",
    ask: "입력 X에 넣는 열은?",
    choices: ["neck, 목둘레", "waist, 허리둘레", "jeans.csv"],
    answer: "neck, 목둘레",
    why: "목둘레를 보고 허리를 맞힌다. X는 문제, y는 정답.",
  },
  {
    id: "reshape-who",
    ask: "reshape(-1, 1)을 붙이는 쪽은?",
    choices: ["X만", "y만", "X와 y 둘 다"],
    answer: "X만",
    why: "사이킷런 입력은 2차원이어야 한다. 정답 y는 1차원 그대로 둔다.",
  },
  {
    id: "reshape-nums",
    ask: "reshape(-1, 1)에서 -1과 1의 뜻은?",
    choices: [
      "행은 자동, 열은 1개",
      "행은 1개, 열은 자동",
      "데이터를 1개만 남긴다",
    ],
    answer: "행은 자동, 열은 1개",
    why: "-1은 '개수는 데이터에 맡긴다'는 자리다. 특성은 목둘레 하나라 열이 1이다.",
  },
  {
    id: "ratio",
    ask: "test_size=0.3 이면?",
    choices: ["시험 30%, 학습 70%", "학습 30%, 시험 70%", "시험 데이터 3개"],
    answer: "시험 30%, 학습 70%",
    why: "test_size는 시험 비율이다. 0.3은 30%고, 학습은 나머지다.",
  },
  {
    id: "order",
    ask: "train_test_split 결과를 받는 순서는?",
    choices: [
      "X_train, X_test, y_train, y_test",
      "y_train, y_test, X_train, X_test",
      "X_test, X_train, y_test, y_train",
    ],
    answer: "X_train, X_test, y_train, y_test",
    why: "X가 y보다 먼저, 각 쌍에서는 train이 test보다 먼저다.",
  },
  {
    id: "module",
    ask: "LinearRegression을 불러오는 모듈은?",
    choices: ["sklearn.linear_model", "sklearn.model_selection", "sklearn.linear_regression"],
    answer: "sklearn.linear_model",
    why: "model_selection은 train_test_split이 있는 곳이다.",
  },
  {
    id: "fit-data",
    ask: "model.fit에 넣는 데이터는?",
    choices: ["X_train, y_train", "X_test, y_test", "X_test만"],
    answer: "X_train, y_train",
    why: "학습용으로만 직선을 맞춘다. 시험 데이터로 fit 하면 안 된다.",
  },
  {
    id: "predict-data",
    ask: "model.predict에 넣는 것은?",
    choices: ["X_test만", "y_test만", "X_test와 y_test"],
    answer: "X_test만",
    why: "예측은 문제만 본다. 정답 y를 넣지 않는다.",
  },
  {
    id: "underscore",
    ask: "이름 끝에 밑줄이 있는 것은?",
    choices: ["coef_ 와 intercept_", "fit 과 predict", "score"],
    answer: "coef_ 와 intercept_",
    why: "기울기와 절편은 학습이 끝난 뒤에 생긴다. fit, predict, score에는 밑줄이 없다.",
  },
  {
    id: "colors",
    ask: "그래프에서 파란 점과 빨간 선은?",
    choices: [
      "파란 scatter가 실제, 빨간 plot이 예측",
      "파란 plot이 예측, 빨간 scatter가 실제",
      "둘 다 실제 데이터",
    ],
    answer: "파란 scatter가 실제, 빨간 plot이 예측",
    why: "점은 실제 시험 데이터, 선은 모델이 예측한 허리.",
  },
]

export const sheetSections: SheetSection[] = [
  {
    id: "sheet-read",
    title: "표 읽기",
    startLine: 1,
    template: `import {{lib}} as {{alias}}
df = pd.{{method}}({{file}})
df.{{head}}()`,
    blanks: [
      blank("lib", "라이브러리", "pandas", "표 라이브러리."),
      blank("alias", "별명", "pd", "두 글자."),
      blank("method", "읽기", "read_csv", "밑줄이 있다."),
      blank("file", "파일", "'jeans.csv'", "따옴표."),
      blank("head", "맨 위", "head", "머리."),
    ],
  },
  {
    id: "sheet-xy",
    title: "목과 허리",
    startLine: 5,
    template: `import {{numpy}} as {{np}}
X = df[{{neck}}].values.{{reshape}}({{shape}})
y = df[{{waist}}].values`,
    blanks: [
      blank("numpy", "배열 라이브러리", "numpy", "넘파이."),
      blank("np", "별명", "np", "두 글자."),
      blank("neck", "입력 열", "'neck'", "목."),
      blank("reshape", "모양", "reshape", "re + shape."),
      blank("shape", "행, 열", "-1, 1", "행 자동, 열 1.", { accept: ["-1,1"] }),
      blank("waist", "정답 열", "'waist'", "허리."),
    ],
  },
  {
    id: "sheet-split",
    title: "학습과 시험",
    startLine: 9,
    template: `from sklearn.{{sel}} import {{func}}
{{left}} = {{call}}(
    X, y, {{size}}, {{seed}})`,
    blanks: [
      blank("sel", "모듈", "model_selection", "나누는 도구."),
      blank("func", "함수", "train_test_split", "세 단어."),
      blank("left", "받는 순서", "X_train, X_test, y_train, y_test", "X 둘, y 둘."),
      blank("call", "호출", "train_test_split", "위에서 불러온 함수."),
      blank("size", "시험 비율", "test_size=0.3", "30%.", { accept: ["test_size=0.30"] }),
      blank("seed", "씨앗", "random_state=42", "42."),
    ],
  },
  {
    id: "sheet-fit",
    title: "직선 학습",
    startLine: 15,
    template: `from sklearn.{{lin}} import {{cls}}
model = {{make}}()
model.{{fit}}({{x}}, {{y}})`,
    blanks: [
      blank("lin", "모듈", "linear_model", "밑줄."),
      blank("cls", "클래스", "LinearRegression", "대문자 두 번."),
      blank("make", "생성", "LinearRegression", "같은 클래스."),
      blank("fit", "학습", "fit", "세 글자."),
      blank("x", "학습 입력", "X_train", "대문자 X."),
      blank("y", "학습 정답", "y_train", "소문자 y."),
    ],
  },
  {
    id: "sheet-score",
    title: "점수와 예측",
    startLine: 19,
    template: `print(model.{{coef}}, model.{{intercept}})

print(model.{{scoreTrain}}({{sx}}, {{sy}}))

print(model.{{scoreTest}}({{tx}}, {{ty}}))

predictions = model.{{predict}}({{px}})`,
    blanks: [
      blank("coef", "기울기", "coef_", "밑줄."),
      blank("intercept", "절편", "intercept_", "밑줄."),
      blank("scoreTrain", "학습 점수", "score", "밑줄 없음."),
      blank("sx", "학습 입력", "X_train", "train."),
      blank("sy", "학습 정답", "y_train", "train."),
      blank("scoreTest", "시험 점수", "score", "같은 함수."),
      blank("tx", "시험 입력", "X_test", "test."),
      blank("ty", "시험 정답", "y_test", "test."),
      blank("predict", "예측", "predict", "밑줄 없음."),
      blank("px", "예측 입력", "X_test", "정답은 넣지 않음."),
    ],
  },
  {
    id: "sheet-plot",
    title: "그래프",
    startLine: 29,
    template: `import matplotlib.pyplot as {{plt}}
plt.{{scatter}}(X_test, y_test, color={{blue}})
plt.{{plot}}(X_test, predictions, color={{red}})
plt.{{xlabel}}('neck')
plt.{{ylabel}}('waist')
plt.{{show}}()`,
    blanks: [
      blank("plt", "별명", "plt", "세 글자."),
      blank("scatter", "점", "scatter", "실제."),
      blank("blue", "점 색", "'blue'", "실제."),
      blank("plot", "선", "plot", "예측."),
      blank("red", "선 색", "'red'", "예측."),
      blank("xlabel", "가로축", "xlabel", "neck."),
      blank("ylabel", "세로축", "ylabel", "waist."),
      blank("show", "출력", "show", "마지막."),
    ],
  },
]

export const story =
  "청바지 치수에서 목둘레를 보고 허리둘레를 맞힌다. 70%로 직선을 맞추고, 30%로 채점하고 예측한다. 파란 점은 실제, 빨간 선은 예측."

export const jeansPoints: [number, number][] = [
  [34, 74],
  [35, 78],
  [36, 80],
  [36.5, 84],
  [37, 83],
  [38, 86],
  [38.5, 89],
  [39, 90],
  [39.5, 93],
  [40, 94],
  [40.5, 97],
  [41, 98],
  [42, 101],
  [43, 104],
  [44, 106],
]

export function fitLine(points: [number, number][]) {
  const count = points.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const [x, y] of points) {
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  const slope = (count * sxy - sx * sy) / (count * sxx - sx * sx)
  const intercept = (sy - slope * sx) / count
  return { slope, intercept }
}

export function questionsFor(stage: number) {
  return questions.filter((question) => question.stage === stage)
}

export function questionCount() {
  return questions.length
}

export function sheetBlankCount() {
  return sheetSections.reduce((sum, section) => sum + section.blanks.length, 0)
}

export function rankFor(percent: number) {
  if (percent >= 95) {
    return { name: "수행평가 각", line: "이 코드는 손에 붙었다. 함정 10개만 한 번 더 보고 자라." }
  }
  if (percent >= 85) {
    return { name: "안정권", line: "틀린 칸의 이유만 다시 읽으면 된다." }
  }
  if (percent >= 70) {
    return { name: "아슬아슬", line: "실전 빈칸지를 한 장 더 풀자. 순서랑 밑줄이 자주 샌다." }
  }
  return { name: "한 번 더", line: "해설을 열고 줄을 소리 내서 읽은 다음, 1단계부터 다시." }
}

export const jeansCourse: Course = {
  id: "jeans",
  kicker: "JEANS LAB",
  title: "진스 도장",
  heroClass: "denim",
  lede: "목둘레로 허리둘레를 맞히는 선형회귀. 선생님이 지운 칸을, 한글 설명만 보고 다시 쓴다.",
  story,
  trainModeText: "설명만 보고 칸을 채운다. 틀리면 목과 허리를 바꿨는지, 밑줄이 빠졌는지 말해 준다.",
  trapModeText: "순서, 30%, 파란 점, 밑줄. 철자보다 이쪽을 더 많이 틀린다.",
  glossaryHint: "이름 검색. 예: coef, 목, split",
  trapClear: "순서, 밑줄, 색, 학습이랑 시험을 다 갈랐다.",
  trapMiss: "틀린 함정은 해설의 그 줄을 다시 보면 된다. 코드 철자보다 이쪽을 선생님이 더 자주 틀린다.",
  figure: "jeans",
  stages,
  questions,
  studyLines,
  glossary,
  traps,
  sheetSections,
  rankFor,
}
