import type { Course } from "./course"
import { blank, eq, rankFor, type StudyLine } from "./content"

const cols = "[['culmen_length_mm', 'culmen_depth_mm', 'flipper_length_mm']]"
const colsNorm = "[['culmen_length_mm','culmen_depth_mm','flipper_length_mm']]"

export const penguinCourse: Course = {
  id: "penguins",
  kicker: "PENGUIN LAB",
  title: "펭귄 도장",
  heroClass: "penguin-hero",
  lede: "부리와 날개로 펭귄 종을 가리는 결정트리. 선생님이 지운 칸을, 한글 설명만 보고 다시 쓴다.",
  story:
    "결측이 있는 행을 지운 뒤, 부리 길이·부리 깊이·날개 길이로 종을 맞힌다. 시험 30%는 종 비율을 유지하고, 나무는 위 두 층만 색을 칠해 그린다.",
  trainModeText:
    "설명만 보고 칸을 채운다. 틀리면 행을 지웠는지, stratify가 빠졌는지, 종을 입력에 넣었는지 말해 준다.",
  trapModeText: "axis=0, stratify, 대괄호 두 겹, max_depth. 진스 코드랑 섞이는 칸을 가른다.",
  glossaryHint: "이름 검색. 예: dropna, stratify, species",
  trapClear: "행 삭제, 층화 분할, 나무 깊이, 시험 점수를 다 갈랐다.",
  trapMiss: "틀린 함정은 해설의 그 줄을 다시 보면 된다. 진스 회귀 코드를 여기에 그대로 붙이면 틀린다.",
  figure: "tree",
  stages: [
    {
      id: 1,
      title: "표 불러오기",
      blurb: "penguins_size.csv를 읽고, info로 열과 결측을 본다.",
    },
    {
      id: 2,
      title: "결측 행 삭제",
      blurb: "비어 있는 값이 있는 행을 표에서 지운다.",
    },
    {
      id: 3,
      title: "부리와 종",
      blurb: "입력은 치수 세 개, 정답은 종 이름.",
    },
    {
      id: 4,
      title: "비율 유지해서 나누기",
      blurb: "시험 30%. 종 비율은 stratify로 유지한다.",
    },
    {
      id: 5,
      title: "결정트리",
      blurb: "DecisionTreeClassifier를 학습 데이터로 fit 한다.",
    },
    {
      id: 6,
      title: "나무 그림과 시험 점수",
      blurb: "위 두 층만 색칠해 그리고, 시험 점수를 출력한다.",
    },
  ],
  questions: [
    {
      id: "pg-import-pandas",
      stage: 1,
      startLine: 1,
      prompt: "표를 다루는 라이브러리를 불러온다. 긴 이름 대신 짧은 별명으로 쓴다.",
      template: "import {{lib}} as {{alias}}",
      blanks: [
        blank("lib", "라이브러리 이름", "pandas", "전부 소문자. 끝에 s.", {
          mistakes: [
            eq("pd", "pd는 별명이다. 라이브러리 이름은 pandas."),
            eq("panda", "끝에 s. pandas."),
            eq("sklearn", "sklearn은 모델 쪽이다. 표를 읽는 쪽은 pandas."),
          ],
        }),
        blank("alias", "짧은 별명", "pd", "두 글자. 전부 소문자.", {
          mistakes: [
            eq("pandas", "pandas는 왼쪽 이름. 별명은 pd."),
            eq("np", "np는 numpy 별명. pandas 별명은 pd."),
          ],
        }),
      ],
      why: "import pandas as pd. 앞으로는 pd.read_csv처럼 짧게 쓴다.",
    },
    {
      id: "pg-read-csv",
      stage: 1,
      startLine: 2,
      prompt: "펭귄 치수가 들어 있는 csv 파일을 읽어서 df라는 표로 만든다.",
      template: "df = pd.{{method}}({{file}})",
      blanks: [
        blank("method", "파일을 읽는 함수", "read_csv", "읽다(read) + 밑줄 + csv.", {
          mistakes: [
            eq("read_excel", "이 파일은 csv다. read_csv."),
            eq("to_csv", "to_csv는 저장이다. 읽는 함수는 read_csv."),
            eq("read", "형식이 csv라는 것까지 적는다. read_csv."),
          ],
        }),
        blank("file", "파일 이름", "'penguins_size.csv'", "확장자까지, 따옴표로 감싼다.", {
          accept: ['"penguins_size.csv"'],
          mistakes: [
            eq("penguins_size.csv", "문자열이라 따옴표가 필요해. 'penguins_size.csv'"),
            eq("'jeans.csv'", "jeans.csv는 회귀 수행이다. 분류 파일은 penguins_size.csv."),
            eq("'penguins.csv'", "파일 이름에 _size가 있다. penguins_size.csv."),
          ],
        }),
      ],
      why: "pd.read_csv('penguins_size.csv')가 파일을 표로 읽어 df에 넣는다.",
    },
    {
      id: "pg-info",
      stage: 1,
      startLine: 3,
      prompt:
        "표의 행 수, 열 이름, 결측이 아닌 값의 개수를 요약해서 본다. 맨 위 5줄을 보는 함수가 아니다.",
      template: "df.{{method}}()",
      blanks: [
        blank("method", "요약 함수", "info", "정보. 괄호 안은 비어 있다.", {
          mistakes: [
            eq("head", "head는 맨 위 5줄이다. 이 코드는 info."),
            eq("describe", "describe는 평균 같은 숫자 요약이다. 열 구성은 info."),
            eq("isnull", "결측 개수는 다음 단계. 지금은 info."),
          ],
        }),
      ],
      why: "df.info()로 열 구성과 비결측 개수를 본다. 괄호를 빼면 실행되지 않는다.",
    },
    {
      id: "pg-isnull",
      stage: 2,
      startLine: 5,
      prompt: "각 열에 비어 있는 값이 몇 개인지 센다. 참/거짓 표를 만든 다음 열마다 더한다.",
      template: "df.{{isnull}}().{{sum}}()",
      blanks: [
        blank("isnull", "결측 표시", "isnull", "is + null. 밑줄 없음.", {
          mistakes: [
            eq("isna", "같은 뜻인 함수가 있지만, 이 수행 코드는 isnull이다."),
            eq("info", "info는 요약이다. 결측 개수는 isnull().sum()."),
            eq("dropna", "dropna는 지우는 함수다. 개수를 보는 건 isnull."),
          ],
        }),
        blank("sum", "개수로 합치기", "sum", "참의 개수를 더한다.", {
          mistakes: [
            eq("count", "count는 비지 않은 개수다. 결측을 세려면 sum."),
            eq("mean", "비율이 아니라 개수다. sum."),
          ],
        }),
      ],
      why: "df.isnull()은 빈칸을 True로 만든다. 뒤에 .sum()을 붙이면 열마다 True 개수, 곧 결측 개수가 나온다.",
    },
    {
      id: "pg-dropna",
      stage: 2,
      startLine: 7,
      prompt:
        "빈 값이 있는 행을 표에서 지운다. 열을 지우는 게 아니고, 지운 결과를 df 자신에 다시 담는다.",
      template: "df.{{method}}({{args}})",
      blanks: [
        blank("method", "지우는 함수", "dropna", "drop + na. 밑줄 없음.", {
          mistakes: [
            eq("drop", "drop은 지정한 행이나 열을 지운다. 결측을 지우려면 dropna."),
            eq("fillna", "fillna는 채우는 함수다. 이 코드는 지운다. dropna."),
            eq("isnull", "isnull은 보기만 한다. 지우는 함수는 dropna."),
          ],
        }),
        blank("args", "축과 반영", "axis=0, inplace=True", "행은 0, 표 자체를 바꾼다.", {
          accept: ["inplace=True, axis=0", "axis=0,inplace=True", "inplace=True,axis=0"],
          mistakes: [
            eq("axis=1, inplace=True", "axis=1은 열을 지운다. 행은 axis=0."),
            eq("axis=1,inplace=True", "axis=1은 열을 지운다. 행은 axis=0."),
            eq("axis=0, inplace=False", "False면 새 표만 나오고 df는 그대로다. inplace=True."),
            eq("axis=0", "축만으로는 df가 안 바뀐다. inplace=True가 필요하다."),
            eq("inplace=True", "어디를 지울지 axis=0도 적는다. 행이다."),
          ],
        }),
      ],
      why: "dropna(axis=0, inplace=True)는 결측이 있는 행을 지우고, 그 결과를 df에 바로 반영한다. axis=1이면 열이 사라진다.",
    },
    {
      id: "pg-info-again",
      stage: 2,
      startLine: 8,
      prompt: "행을 지운 뒤, 행 수가 줄었는지 같은 요약으로 다시 확인한다.",
      template: "df.{{method}}()",
      blanks: [
        blank("method", "다시 보는 요약", "info", "처음과 같은 함수.", {
          mistakes: [
            eq("head", "맨 위 5줄이 아니라 행 수와 결측 요약을 다시 본다. info."),
            eq("isnull", "결측 개수는 이미 봤다. 삭제 후 확인은 info."),
          ],
        }),
      ],
      why: "두 번째 df.info()는 결측 행을 지운 뒤 남은 행을 확인하는 줄이다.",
    },
    {
      id: "pg-x-cols",
      stage: 3,
      startLine: 10,
      prompt:
        "입력 X는 열 세 개다. 부리 길이, 부리 깊이, 날개 길이. 종 이름과 몸무게는 넣지 않는다. 열이 여러 개라 대괄호가 두 겹이다.",
      template: "X = df{{cols}}",
      blanks: [
        blank("cols", "입력 열 세 개", cols, "culmen 둘, flipper 하나. 대괄호 두 겹.", {
          accept: [colsNorm],
          mistakes: [
            eq(
              "['culmen_length_mm','culmen_depth_mm','flipper_length_mm']",
              "한 겹이면 열이 아니라 이상한 키가 된다. 대괄호를 두 겹으로.",
            ),
            eq(
              "[['species','culmen_length_mm','culmen_depth_mm']]",
              "species는 정답 y다. X에는 넣지 않는다.",
            ),
            eq(
              "[['culmen_length_mm','culmen_depth_mm','flipper_length_mm','body_mass_g']]",
              "몸무게 body_mass_g는 이 수행의 입력이 아니다. 열은 세 개다.",
            ),
            eq(
              "[['culmen_depth_mm','culmen_length_mm','flipper_length_mm']]",
              "부리 길이가 먼저, 그다음 부리 깊이다.",
            ),
            eq(
              "[['culmen_length','culmen_depth','flipper_length']]",
              "열 이름 끝에 _mm가 붙는다.",
            ),
          ],
        }),
      ],
      why: "X = df[['culmen_length_mm', 'culmen_depth_mm', 'flipper_length_mm']]. 여러 열은 대괄호 두 겹이고, 맞힐 종은 여기 넣지 않는다.",
    },
    {
      id: "pg-y",
      stage: 3,
      startLine: 11,
      prompt: "정답 y는 펭귄 종이다. 열 하나라 대괄호는 한 겹이고, 따옴표로 열 이름을 감싼다.",
      template: "y = df[{{col}}]",
      blanks: [
        blank("col", "정답 열", "'species'", "종. 따옴표.", {
          accept: ['"species"'],
          mistakes: [
            eq("species", "열 이름은 문자라 따옴표가 필요해. 'species'"),
            eq("'culmen_length_mm'", "그건 입력 열이다. 정답은 species."),
            eq("'island'", "섬 이름이 아니라 종이다. species."),
            eq("['species']", "열 하나라 대괄호 없이 'species'만."),
          ],
        }),
      ],
      why: "y = df['species']. 분류에서 y는 종류다. Adelie, Chinstrap, Gentoo가 이 열에 들어 있다.",
    },
    {
      id: "pg-import-split",
      stage: 4,
      startLine: 13,
      prompt: "학습용과 시험용으로 나누는 함수를 불러온다. 결정트리가 있는 곳이 아니다.",
      template: "from sklearn.{{module}} import {{func}}",
      blanks: [
        blank("module", "모듈", "model_selection", "나누는 도구. 밑줄.", {
          mistakes: [
            eq("tree", "tree는 결정트리가 있는 곳이다. 나누기는 model_selection."),
            eq("linear_model", "linear_model은 회귀 직선이다. 나누기는 model_selection."),
          ],
        }),
        blank("func", "함수", "train_test_split", "세 단어. 밑줄 두 개.", {
          mistakes: [
            eq("DecisionTreeClassifier", "그건 모델 클래스다. 여기서 부르는 건 train_test_split."),
          ],
        }),
      ],
      why: "from sklearn.model_selection import train_test_split. 모델은 다음 단계에서 sklearn.tree로 부른다.",
    },
    {
      id: "pg-unpack",
      stage: 4,
      startLine: 14,
      prompt: "나눈 결과를 받는 순서. 입력 두 개가 먼저고, 각 쌍에서는 학습이 시험보다 먼저다.",
      template: "{{left}} = train_test_split(",
      blanks: [
        blank(
          "left",
          "받는 순서",
          "X_train, X_test, y_train, y_test",
          "X 둘, 그다음 y 둘.",
          {
            mistakes: [
              eq(
                "X_test, X_train, y_test, y_train",
                "test가 train보다 앞에 있다. train이 먼저다.",
              ),
              eq(
                "y_train, y_test, X_train, X_test",
                "y가 먼저가 아니다. X 두 개, 그다음 y 두 개.",
              ),
              eq(
                "X_train, y_train, X_test, y_test",
                "X와 y를 번갈아 받지 않는다. X를 둘 다 받은 다음 y다.",
              ),
            ],
          },
        ),
      ],
      why: "받는 순서는 X_train, X_test, y_train, y_test. 회귀 수행이랑 같다.",
    },
    {
      id: "pg-split-args",
      stage: 4,
      startLine: 15,
      prompt:
        "시험 비율은 30%다. 이 수행에는 섞기 씨앗이 없다. 대신 학습과 시험에 종 비율이 비슷하게 남도록 정답 y를 기준으로 나눈다.",
      template: "    X, y, {{args}})",
      blanks: [
        blank("args", "시험 비율과 층화", "test_size=0.3, stratify=y", "0.3은 시험. stratify는 종 비율.", {
          accept: ["test_size=0.30, stratify=y", "stratify=y, test_size=0.3"],
          mistakes: [
            eq(
              "test_size=0.3, random_state=42",
              "random_state=42는 진스 회귀 코드다. 이 분류 코드는 stratify=y.",
            ),
            eq(
              "test_size=0.3, stratify=y, random_state=42",
              "이 수행 줄에는 random_state가 없다. test_size와 stratify만.",
            ),
            eq("test_size=0.3", "비율만으로는 부족하다. stratify=y가 있어야 종 비율이 유지된다."),
            eq("stratify=y", "종 비율만으로는 부족하다. test_size=0.3도 있다."),
            eq(
              "test_size=0.7, stratify=y",
              "0.7이면 시험이 70%가 된다. 시험은 0.3이다.",
            ),
            eq(
              "test_size=0.3, stratify=X",
              "비율을 맞출 기준은 정답 종이다. stratify=y.",
            ),
            eq(
              "test_size=0.3, stratify='species'",
              "열 이름이 아니라 이미 만들어 둔 정답 y를 넣는다. stratify=y.",
            ),
          ],
        }),
      ],
      why: "train_test_split(X, y, test_size=0.3, stratify=y). test_size=0.3은 시험 30%, 학습 70%. stratify=y는 종 비율이 한쪽으로 몰리지 않게 나눈다.",
    },
    {
      id: "pg-import-tree",
      stage: 5,
      startLine: 17,
      prompt: "분류 나무 클래스를 불러온다. 단어 두 개의 첫 글자가 대문자고, 밑줄은 없다.",
      template: "from sklearn.{{module}} import {{cls}}",
      blanks: [
        blank("module", "모듈", "tree", "나무. 한 단어.", {
          mistakes: [
            eq("model_selection", "model_selection은 방금 나눈 함수가 있던 곳이다."),
            eq("linear_model", "linear_model은 회귀 직선이다. 나무는 tree."),
            eq("ensemble", "ensemble은 나무를 여러 개 모을 때다. 한 그루는 tree."),
          ],
        }),
        blank("cls", "클래스", "DecisionTreeClassifier", "Decision, Tree, Classifier.", {
          mistakes: [
            eq("LinearRegression", "LinearRegression은 진스 회귀다. 분류는 DecisionTreeClassifier."),
            eq("DecisionTreeRegressor", "Regressor는 숫자를 맞힌다. 종 이름은 Classifier."),
            eq("plot_tree", "plot_tree는 그리는 함수다. 모델 클래스가 아니다."),
            eq("RandomForestClassifier", "이 수행은 나무 한 그루다. DecisionTreeClassifier."),
          ],
        }),
      ],
      why: "from sklearn.tree import DecisionTreeClassifier. 종처럼 종류를 맞히면 Classifier, 허리둘레처럼 숫자를 맞히면 회귀다.",
    },
    {
      id: "pg-make",
      stage: 5,
      startLine: 18,
      prompt: "빈 결정트리를 만들어 dt에 담는다. 괄호 안은 비어 있다. 아직 학습 전이다.",
      template: "dt = {{cls}}()",
      blanks: [
        blank("cls", "생성", "DecisionTreeClassifier", "위에서 불러온 클래스.", {
          mistakes: [
            eq("LinearRegression", "이 모델은 직선이 아니다. DecisionTreeClassifier."),
            eq("DecisionTreeClassifier()", "괄호는 코드에 이미 있다. 칸에는 이름만."),
            eq("plot_tree", "plot_tree는 그림을 그린다. 모델은 DecisionTreeClassifier."),
          ],
        }),
      ],
      why: "dt = DecisionTreeClassifier(). dt는 decision tree의 줄임으로 이 수행이 쓰는 이름이다.",
    },
    {
      id: "pg-fit",
      stage: 5,
      startLine: 19,
      prompt: "학습용 입력과 학습용 종으로 나무를 맞춘다. 시험 데이터는 넣지 않는다.",
      template: "dt.{{method}}({{x}}, {{y}})",
      blanks: [
        blank("method", "학습", "fit", "세 글자. 밑줄 없음.", {
          mistakes: [
            eq("predict", "predict는 맞히기다. 먼저 fit으로 학습한다."),
            eq("score", "score는 채점이다. 학습은 fit."),
            eq("fit_", "fit에는 밑줄이 없다."),
          ],
        }),
        blank("x", "학습 입력", "X_train", "대문자 X, train.", {
          mistakes: [
            eq("X_test", "시험 입력으로 학습하면 안 된다. X_train."),
            eq("y_train", "y_train은 정답이다. 입력은 X_train."),
            eq("X", "나누기 전 전체가 아니다. 학습용 X_train."),
          ],
        }),
        blank("y", "학습 정답", "y_train", "소문자 y, train.", {
          mistakes: [
            eq("y_test", "시험 정답으로 fit 하지 않는다. y_train."),
            eq("X_train", "두 칸 다 입력이 되면 정답이 없다. 두 번째는 y_train."),
          ],
        }),
      ],
      why: "dt.fit(X_train, y_train). 학습용 치수와 학습용 종으로만 나무를 만든다.",
    },
    {
      id: "pg-score-train",
      stage: 5,
      startLine: 20,
      prompt: "학습 데이터로 나무의 점수를 출력한다. 함수 이름에는 밑줄이 없다.",
      template: "print(dt.{{method}}({{x}}, {{y}}))",
      blanks: [
        blank("method", "점수 함수", "score", "밑줄 없음.", {
          mistakes: [
            eq("score_", "score에는 밑줄이 없다. 밑줄은 회귀의 coef_, intercept_ 쪽이다."),
            eq("predict", "이건 점수를 출력하는 줄이다. predict가 아니다."),
          ],
        }),
        blank("x", "학습 입력", "X_train", "train."),
        blank("y", "학습 정답", "y_train", "train."),
      ],
      why: "print(dt.score(X_train, y_train))은 학습 점수다. 나무에 이미 보여 준 데이터라 점수가 높게 나오는 경우가 많다.",
    },
    {
      id: "pg-import-plt",
      stage: 6,
      startLine: 22,
      prompt: "그래프 도구를 불러온다. 별명은 세 글자다.",
      template: "import matplotlib.pyplot as {{alias}}",
      blanks: [
        blank("alias", "별명", "plt", "plot의 줄임.", {
          mistakes: [
            eq("pyplot", "pyplot는 왼쪽 이름에 들어 있다. 별명은 plt."),
            eq("pd", "pd는 pandas 별명이다."),
          ],
        }),
      ],
      why: "import matplotlib.pyplot as plt. 그림 크기를 정할 때 plt.figure를 쓴다.",
    },
    {
      id: "pg-import-plot",
      stage: 6,
      startLine: 23,
      prompt: "나무를 그리는 함수를 불러온다. 모델 클래스와 이름이 다르다.",
      template: "from sklearn.tree import {{name}}",
      blanks: [
        blank("name", "그리는 함수", "plot_tree", "plot + 밑줄 + tree.", {
          mistakes: [
            eq("DecisionTreeClassifier", "클래스는 이미 불러 왔다. 그리는 함수는 plot_tree."),
            eq("plottree", "가운데 밑줄이 있다. plot_tree."),
            eq("tree_plot", "순서가 plot_tree다."),
          ],
        }),
      ],
      why: "from sklearn.tree import plot_tree. 같은 모듈에서 클래스와 그리는 함수를 따로 부른다.",
    },
    {
      id: "pg-figure",
      stage: 6,
      startLine: 24,
      prompt: "그림 크기를 가로 20, 세로 10으로 잡는다. 나무가 넓어서 가로가 길다.",
      template: "plt.figure(figsize={{size}})",
      blanks: [
        blank("size", "가로, 세로", "(20, 10)", "가로가 먼저.", {
          accept: ["(20,10)"],
          mistakes: [
            eq("(10, 20)", "가로는 20, 세로는 10이다. (20, 10)."),
            eq("(20, 10, 2)", "크기는 가로와 세로 두 개다."),
            eq("20, 10", "괄호로 묶는다. (20, 10)."),
          ],
        }),
      ],
      why: "plt.figure(figsize=(20, 10))으로 넓은 도화지를 만든 다음 나무를 그린다.",
    },
    {
      id: "pg-plot-tree",
      stage: 6,
      startLine: 25,
      prompt:
        "학습된 나무를 그린다. 칸 이름에는 입력 열 이름을 쓰고, 깊이는 위 두 층만, 칸에는 색을 칠한다.",
      template:
        "plot_tree({{model}}, feature_names={{names}}, max_depth={{depth}}, filled={{filled}})",
      blanks: [
        blank("model", "그릴 모델", "dt", "만들어 둔 나무.", {
          mistakes: [
            eq("DecisionTreeClassifier", "클래스 전체가 아니라 dt라는 학습된 모델이다."),
            eq("model", "이 수행의 변수 이름은 model이 아니라 dt다."),
          ],
        }),
        blank("names", "칸에 쓸 열 이름", "X.columns", "입력 X의 열.", {
          mistakes: [
            eq("y", "정답 종이 아니라 입력 열 이름이다. X.columns."),
            eq("df.columns", "표의 모든 열이 아니다. 입력으로 쓴 X.columns."),
            eq("X", "X 전체가 아니라 열 이름이다. X.columns."),
          ],
        }),
        blank("depth", "그릴 깊이", "2", "위 두 층만.", {
          mistakes: [
            eq("3", "이 수행은 두 층만 그린다. max_depth=2."),
            eq("1", "한 층이 아니다. 2."),
            eq("None", "전체를 그리지 않는다. 2."),
          ],
        }),
        blank("filled", "색 채우기", "True", "첫 글자 대문자.", {
          mistakes: [
            eq("False", "이 수행은 칸에 색을 칠한다. filled=True."),
            eq("'True'", "따옴표 없는 논리값이다. True."),
          ],
        }),
      ],
      why: "plot_tree(dt, feature_names=X.columns, max_depth=2, filled=True). max_depth=2는 뿌리에서 두 번만 내려가고, filled=True는 노드에 색을 칠한다.",
    },
    {
      id: "pg-show",
      stage: 6,
      startLine: 26,
      prompt: "그래프를 화면에 띄운다. 괄호 안은 비어 있다.",
      template: "plt.{{method}}()",
      blanks: [
        blank("method", "출력", "show", "보여 주기.", {
          mistakes: [
            eq("plot", "plot은 선을 그릴 때다. 화면 출력은 show."),
            eq("figure", "figure는 이미 위에서 크기를 정했다. 지금은 show."),
          ],
        }),
      ],
      why: "plt.show()로 나무 그림을 연다.",
    },
    {
      id: "pg-pred",
      stage: 6,
      startLine: 28,
      prompt:
        "시험 치수만 보고 종을 예측한다. 결과는 새 이름이 아니라 나무 객체의 pred에 넣는다. 정답은 괄호에 넣지 않는다.",
      template: "{{left}} = dt.predict({{x}})",
      blanks: [
        blank("left", "담는 곳", "dt.pred", "모델 이름 점 pred.", {
          mistakes: [
            eq("predictions", "진스 코드는 predictions다. 이 분류 코드는 dt.pred."),
            eq("pred", "dt. 이 빠졌다. dt.pred."),
            eq("dt.predict", "오른쪽이 이미 predict다. 왼쪽 이름은 dt.pred."),
          ],
        }),
        blank("x", "예측 입력", "X_test", "시험 치수만.", {
          mistakes: [
            eq("y_test", "정답을 넣으면 예측이 아니다. X_test."),
            eq("X_train", "이미 학습에 쓴 입력이 아니다. 시험 입력 X_test."),
            eq("X_test, y_test", "predict에는 입력만 넣는다. X_test."),
          ],
        }),
      ],
      why: "dt.pred = dt.predict(X_test). 예측은 문제만 본다. 이 수행은 결과 이름을 predictions로 짓지 않는다.",
    },
    {
      id: "pg-score-test",
      stage: 6,
      startLine: 29,
      prompt:
        "시험 점수를 출력한다. 문장에는 결정트리 모델 성능 평가라고 적고, 채점 데이터는 시험용이다.",
      template: "print({{label}}, dt.score({{x}}, {{y}}))",
      blanks: [
        blank("label", "출력 문장", "'결정트리 모델 성능 평가: '", "따옴표. 끝에 콜론.", {
          accept: [
            "'결정트리 모델 성능 평가:'",
            '"결정트리 모델 성능 평가: "',
            '"결정트리 모델 성능 평가:"',
          ],
          mistakes: [
            eq("'예측값:'", "그 문장은 진스 회귀 출력이다. 여기는 결정트리 모델 성능 평가."),
            eq("결정트리 모델 성능 평가", "문장이라 따옴표가 필요해."),
            eq("'테스트 결괏값:'", "결괏값을 찍는 줄이 아니다. 성능 평가 문장이다."),
          ],
        }),
        blank("x", "시험 입력", "X_test", "test.", {
          mistakes: [eq("X_train", "학습 점수는 위에서 이미 출력했다. 여기는 X_test.")],
        }),
        blank("y", "시험 정답", "y_test", "test.", {
          mistakes: [eq("y_train", "학습 정답이 아니다. y_test.")],
        }),
      ],
      why: 'print("결정트리 모델 성능 평가: ", dt.score(X_test, y_test)). 학습에 안 쓴 30%로 종을 얼마나 맞혔는지 본다.',
    },
  ],
  studyLines: [
    {
      code: "import pandas as pd",
      say: "표 라이브러리. 별명은 pd.",
    },
    {
      code: "df = pd.read_csv('penguins_size.csv')",
      say: "펭귄 치수 파일을 표로 읽는다.",
      trap: "jeans.csv가 아니다.",
    },
    {
      code: "df.info()",
      say: "열 이름, 행 수, 비어 있지 않은 값의 개수를 본다.",
      trap: "맨 위 5줄은 head. 이 코드는 info.",
    },
    { code: "", say: "" },
    {
      code: "df.isnull().sum()",
      say: "열마다 결측이 몇 개인지 센다.",
      trap: "이 수행은 isna가 아니라 isnull이다.",
    },
    { code: "", say: "" },
    {
      code: "df.dropna(axis=0, inplace=True)",
      say: "결측이 있는 행을 지우고, 그 결과를 df에 바로 반영한다.",
      trap: "axis=1은 열 삭제. inplace=False면 df가 안 바뀐다.",
    },
    {
      code: "df.info()",
      say: "지운 뒤 행이 줄었는지 다시 확인한다.",
    },
    { code: "", say: "" },
    {
      code: "X = df[['culmen_length_mm', 'culmen_depth_mm', 'flipper_length_mm']]",
      say: "입력은 부리 길이, 부리 깊이, 날개 길이. 열이 여러 개라 대괄호가 두 겹이다.",
      trap: "species와 body_mass_g는 넣지 않는다.",
    },
    {
      code: "y = df['species']",
      say: "정답은 종. Adelie, Chinstrap, Gentoo.",
      trap: "열 하나라 대괄호는 한 겹.",
    },
    { code: "", say: "" },
    {
      code: "from sklearn.model_selection import train_test_split",
      say: "학습용과 시험용으로 나누는 함수.",
      trap: "DecisionTreeClassifier는 여기 없다.",
    },
    {
      code: "X_train, X_test, y_train, y_test = train_test_split(",
      say: "받는 순서. X 두 개, 그다음 y 두 개. train이 test보다 먼저.",
    },
    {
      code: "    X, y, test_size=0.3, stratify=y)",
      say: "시험 30%. stratify=y로 종 비율을 학습과 시험에 비슷하게 남긴다.",
      trap: "이 줄에는 random_state=42가 없다. 그건 진스 회귀 코드다.",
    },
    { code: "", say: "" },
    {
      code: "from sklearn.tree import DecisionTreeClassifier",
      say: "분류 나무 클래스. 종류를 맞힌다.",
      trap: "LinearRegression이 아니다. Regressor도 아니다.",
    },
    {
      code: "dt = DecisionTreeClassifier()",
      say: "빈 나무를 dt에 담는다. 괄호 안은 비어 있다.",
    },
    {
      code: "dt.fit(X_train, y_train)",
      say: "학습용 치수와 학습용 종으로 나무를 맞춘다.",
      trap: "fit에 test를 넣지 않는다.",
    },
    {
      code: "print(dt.score(X_train, y_train))",
      say: "학습 점수. 밑줄 없는 score.",
    },
    { code: "", say: "" },
    {
      code: "import matplotlib.pyplot as plt",
      say: "그래프 도구. 별명 plt.",
    },
    {
      code: "from sklearn.tree import plot_tree",
      say: "나무를 그리는 함수. 클래스와 따로 불러온다.",
      trap: "plot_tree. 밑줄이 있다.",
    },
    {
      code: "plt.figure(figsize=(20, 10))",
      say: "가로 20, 세로 10인 도화지.",
    },
    {
      code: "plot_tree(dt, feature_names=X.columns, max_depth=2, filled=True)",
      say: "열 이름을 붙이고, 위 두 층만, 칸에 색을 칠해 그린다.",
      trap: "max_depth=2. filled의 True는 대문자.",
    },
    {
      code: "plt.show()",
      say: "그림을 화면에 띄운다.",
    },
    { code: "", say: "" },
    {
      code: "dt.pred = dt.predict(X_test)",
      say: "시험 치수만 보고 종을 예측해 dt.pred에 넣는다.",
      trap: "변수 이름은 predictions가 아니다. 정답 y_test를 넣지 않는다.",
    },
    {
      code: 'print("결정트리 모델 성능 평가: ", dt.score(X_test, y_test))',
      say: "시험 점수. 학습에 안 쓴 데이터로 종을 얼마나 맞혔는지.",
      trap: "위 학습 점수와 함수는 같고 데이터가 test다.",
    },
  ] satisfies StudyLine[],
  glossary: [
    { term: "pandas / pd", say: "표를 다루는 라이브러리와 그 별명.", write: "import pandas as pd" },
    { term: "read_csv", say: "csv 파일을 표로 읽는다.", write: "pd.read_csv('penguins_size.csv')" },
    { term: "info", say: "행 수, 열 이름, 비결측 개수 요약.", write: "df.info()" },
    { term: "isnull().sum()", say: "열마다 결측 개수.", write: "df.isnull().sum()" },
    { term: "dropna", say: "결측이 있는 행이나 열을 지운다.", write: "df.dropna(...)" },
    { term: "axis=0", say: "행 방향. 0이면 행을 지운다.", write: "axis=0" },
    { term: "inplace=True", say: "결과를 df 자신에 반영한다.", write: "inplace=True" },
    { term: "X 세 열", say: "부리 길이, 부리 깊이, 날개 길이.", write: "culmen_length_mm, culmen_depth_mm, flipper_length_mm" },
    { term: "대괄호 두 겹", say: "열이 여러 개일 때 df[[...]].", write: "df[['a', 'b']]" },
    { term: "y / species", say: "정답. 펭귄 종.", write: "df['species']" },
    { term: "train_test_split", say: "학습용과 시험용으로 자른다.", write: "train_test_split(...)" },
    { term: "받는 순서", say: "X 두 개 다음 y 두 개. train이 먼저.", write: "X_train, X_test, y_train, y_test" },
    { term: "test_size=0.3", say: "시험 30%. 학습은 나머지 70%.", write: "test_size=0.3" },
    { term: "stratify=y", say: "정답 비율을 유지한 채 나눈다. 이 코드에는 random_state가 없다.", write: "stratify=y" },
    { term: "DecisionTreeClassifier", say: "분류 나무. 종류를 맞힌다.", write: "DecisionTreeClassifier()" },
    { term: "fit", say: "학습. 시험 데이터는 넣지 않는다.", write: "dt.fit(X_train, y_train)" },
    { term: "score", say: "정확도. 밑줄 없음.", write: "dt.score(X, y)" },
    { term: "plot_tree", say: "결정트리를 그림으로 그린다.", write: "plot_tree(dt, ...)" },
    { term: "feature_names", say: "그림 칸에 쓸 열 이름.", write: "feature_names=X.columns" },
    { term: "max_depth=2", say: "뿌리에서 두 층만 그린다.", write: "max_depth=2" },
    { term: "filled=True", say: "노드에 색을 칠한다.", write: "filled=True" },
    { term: "figsize", say: "그림의 가로, 세로.", write: "figsize=(20, 10)" },
    { term: "dt.pred", say: "시험 데이터 예측을 담는 이름.", write: "dt.pred = dt.predict(X_test)" },
    { term: "성능 평가 문장", say: "시험 점수 앞에 붙는 한글.", write: '"결정트리 모델 성능 평가: "' },
  ],
  traps: [
    {
      id: "axis",
      ask: "df.dropna(axis=0, inplace=True)에서 axis=0은?",
      choices: ["결측이 있는 행을 지운다", "결측이 있는 열을 지운다", "결측을 0으로 채운다"],
      answer: "결측이 있는 행을 지운다",
      why: "axis=0은 행이다. 열을 지우려면 axis=1이다.",
    },
    {
      id: "inplace",
      ask: "inplace=True를 빼면?",
      choices: [
        "새 표만 나오고 원래 df는 그대로다",
        "df의 결측 행이 지워진다",
        "오류가 나서 코드가 멈춘다",
      ],
      answer: "새 표만 나오고 원래 df는 그대로다",
      why: "inplace=True여야 지운 결과가 df에 다시 담긴다.",
    },
    {
      id: "x-cols",
      ask: "입력 X에 넣는 열은?",
      choices: [
        "부리 길이, 부리 깊이, 날개 길이",
        "종, 섬, 성별",
        "부리 길이, 부리 깊이, 몸무게",
      ],
      answer: "부리 길이, 부리 깊이, 날개 길이",
      why: "culmen_length_mm, culmen_depth_mm, flipper_length_mm. species는 정답이고 body_mass_g는 이 수행의 입력이 아니다.",
    },
    {
      id: "brackets",
      ask: "열이 세 개인 X를 꺼낼 때 대괄호는?",
      choices: ["두 겹 [[ ]]", "한 겹 [ ]", "괄호를 쓰지 않는다"],
      answer: "두 겹 [[ ]]",
      why: "여러 열은 df[['a', 'b']]. 종 하나인 y는 df['species']로 한 겹이다.",
    },
    {
      id: "stratify",
      ask: "이 분류 코드의 train_test_split에 있는 것은?",
      choices: ["test_size=0.3, stratify=y", "test_size=0.3, random_state=42", "stratify=X"],
      answer: "test_size=0.3, stratify=y",
      why: "random_state=42는 진스 회귀 코드다. 여기서는 종 비율을 유지하려고 stratify=y를 쓴다.",
    },
    {
      id: "ratio",
      ask: "test_size=0.3 이면?",
      choices: ["시험 30%, 학습 70%", "학습 30%, 시험 70%", "종을 3개만 남긴다"],
      answer: "시험 30%, 학습 70%",
      why: "test_size는 시험 비율이다. 0.3은 30%고 학습은 나머지다.",
    },
    {
      id: "model",
      ask: "종을 맞히는 모델 클래스는?",
      choices: ["DecisionTreeClassifier", "LinearRegression", "DecisionTreeRegressor"],
      answer: "DecisionTreeClassifier",
      why: "종류를 맞히면 Classifier다. LinearRegression은 진스 회귀, Regressor는 숫자를 맞힌다.",
    },
    {
      id: "depth",
      ask: "plot_tree의 max_depth=2는?",
      choices: ["위 두 층만 그린다", "나무를 두 개 만든다", "시험 데이터를 2%만 쓴다"],
      answer: "위 두 층만 그린다",
      why: "깊이 2까지만 그림으로 보여 준다. 학습된 나무 전체를 두 층으로 다시 맞추라는 뜻은 아니다.",
    },
    {
      id: "predict",
      ask: "시험 종 예측을 담는 코드는?",
      choices: ["dt.pred = dt.predict(X_test)", "predictions = dt.predict(y_test)", "dt.pred = dt.predict(X_train)"],
      answer: "dt.pred = dt.predict(X_test)",
      why: "예측에는 시험 치수만 넣는다. 이름도 predictions가 아니라 dt.pred다.",
    },
    {
      id: "eval",
      ask: "마지막 성능 평가가 채점하는 데이터는?",
      choices: ["X_test, y_test", "X_train, y_train", "X 전체와 species 전체"],
      answer: "X_test, y_test",
      why: "학습 점수는 위에서 이미 출력했다. 결정트리 모델 성능 평가는 시험 30%다.",
    },
  ],
  sheetSections: [
    {
      id: "pg-sheet-read",
      title: "표 읽기",
      startLine: 1,
      template: `import {{lib}} as {{alias}}
df = pd.{{method}}({{file}})
df.{{info}}()`,
      blanks: [
        blank("lib", "라이브러리", "pandas", "표."),
        blank("alias", "별명", "pd", "두 글자."),
        blank("method", "읽기", "read_csv", "밑줄."),
        blank("file", "파일", "'penguins_size.csv'", "따옴표."),
        blank("info", "요약", "info", "head가 아님."),
      ],
    },
    {
      id: "pg-sheet-na",
      title: "결측",
      startLine: 5,
      template: `df.{{isnull}}().{{sum}}()
df.{{dropna}}({{args}})
df.{{info2}}()`,
      blanks: [
        blank("isnull", "결측 표시", "isnull", "isna 아님."),
        blank("sum", "개수", "sum", "더하기."),
        blank("dropna", "삭제", "dropna", "drop + na."),
        blank("args", "행, 반영", "axis=0, inplace=True", "행은 0.", {
          accept: ["inplace=True, axis=0"],
        }),
        blank("info2", "다시 요약", "info", "같은 함수."),
      ],
    },
    {
      id: "pg-sheet-xy",
      title: "입력과 정답",
      startLine: 10,
      template: `X = df{{cols}}
y = df[{{species}}]`,
      blanks: [
        blank("cols", "입력 열", cols, "세 열, 대괄호 두 겹.", { accept: [colsNorm] }),
        blank("species", "정답 열", "'species'", "종."),
      ],
    },
    {
      id: "pg-sheet-split",
      title: "나누기",
      startLine: 13,
      template: `from sklearn.{{sel}} import {{func}}
{{left}} = {{call}}(
    X, y, {{splitArgs}})`,
      blanks: [
        blank("sel", "모듈", "model_selection", "밑줄."),
        blank("func", "함수", "train_test_split", "세 단어."),
        blank("left", "받는 순서", "X_train, X_test, y_train, y_test", "X 둘, y 둘."),
        blank("call", "호출", "train_test_split", "같은 함수."),
        blank("splitArgs", "비율과 층화", "test_size=0.3, stratify=y", "random_state 없음.", {
          accept: ["stratify=y, test_size=0.3"],
        }),
      ],
    },
    {
      id: "pg-sheet-tree",
      title: "결정트리 학습",
      startLine: 17,
      template: `from sklearn.{{mod}} import {{cls}}
dt = {{make}}()
dt.{{fit}}({{x}}, {{y}})
print(dt.{{score}}({{sx}}, {{sy}}))`,
      blanks: [
        blank("mod", "모듈", "tree", "나무."),
        blank("cls", "클래스", "DecisionTreeClassifier", "Classifier."),
        blank("make", "생성", "DecisionTreeClassifier", "같은 이름."),
        blank("fit", "학습", "fit", "밑줄 없음."),
        blank("x", "학습 입력", "X_train", "train."),
        blank("y", "학습 정답", "y_train", "train."),
        blank("score", "점수", "score", "밑줄 없음."),
        blank("sx", "학습 입력", "X_train", "train."),
        blank("sy", "학습 정답", "y_train", "train."),
      ],
    },
    {
      id: "pg-sheet-plot",
      title: "그림과 시험 점수",
      startLine: 22,
      template: `import matplotlib.pyplot as {{plt}}
from sklearn.tree import {{plot}}
plt.figure(figsize={{size}})
plot_tree({{dt}}, feature_names={{names}}, max_depth={{depth}}, filled={{filled}})
plt.{{show}}()
{{pred}} = dt.predict({{px}})
print({{label}}, dt.score({{tx}}, {{ty}}))`,
      blanks: [
        blank("plt", "별명", "plt", "세 글자."),
        blank("plot", "그리는 함수", "plot_tree", "밑줄."),
        blank("size", "크기", "(20, 10)", "가로 20.", { accept: ["(20,10)"] }),
        blank("dt", "모델", "dt", "변수 이름."),
        blank("names", "열 이름", "X.columns", "입력 열."),
        blank("depth", "깊이", "2", "두 층."),
        blank("filled", "색", "True", "대문자."),
        blank("show", "출력", "show", "화면."),
        blank("pred", "담는 곳", "dt.pred", "predictions 아님."),
        blank("px", "예측 입력", "X_test", "정답 제외."),
        blank("label", "문장", "'결정트리 모델 성능 평가: '", "따옴표.", {
          accept: ["'결정트리 모델 성능 평가:'"],
        }),
        blank("tx", "시험 입력", "X_test", "test."),
        blank("ty", "시험 정답", "y_test", "test."),
      ],
    },
  ],
  rankFor,
}
