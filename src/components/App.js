  /* global  */
import Header from "./Header";
import Loader from "./Loader";
import Main from "./Main";
import Error from "./Error";
import { useEffect, useReducer } from "react";
import Question from "./Question";
import NextButton from "./NextButton";
import FinishScreen from "./FinishScreen";
import Progress from "./Progress";

const initialState = {
  questions: [],
  status: "loading", // Changed 'Status' to 'status'
  index : 0,
  answer:null,
  points:0, 
  highscore: 0, 
};

function reducer(state, action) {
  switch(action.type) {
    case 'dataReceived':
      return {
        ...state,
        status: "ready",
        questions: action.payload,
      };
    case 'dataFailed':
      return {
        ...state,
        status: "error",
      };
    case 'start': // Added case for 'start' action
      return {
        ...state,
        status: "active", // Example: Change to 'active' when starting quiz
      };
      case "newAnswer":
        const question = state.questions.at(state.index);

        return {
          ...state,
          answer: action.payload,
          points:
            action.payload === question.correctOption
              ? state.points + question.points
              : state.points,
        };
        case "nextQuestion":
          return { ...state, index: state.index + 1, answer: null };
        case "finish":
          return {
            ...state,
            status: "finished",
            highscore:
              state.points > state.highscore ? state.points : state.highscore,
          };
          case "restart":
              return { ...initialState, questions: state.questions, status: "ready" }
    default:
      throw new Error('Action is unknown');
  }
}

export default function App() {
  const [{ questions, status, index, answer, points, highscore}, dispatch] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );
  useEffect(() => {
    fetch("http://localhost:9000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => {
        console.error("Failed to fetch questions:", err);
        dispatch({ type: "dataFailed" });
      });
  }, []); // Empty dependency array since we only want to fetch once on mount

  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <div className="start">
            <h2>Welcome to The React Quiz!</h2>
            <h3>{numQuestions} questions to test your React mastery</h3>
            <button
              className="btn btn-ui"
              onClick={() => dispatch({ type: "start" })}
            >
              Let's start
            </button>
          </div>
        )}
        {status === "active" &&  
        <>
        <Progress numQuestions={numQuestions} maxPossiblePoints={maxPossiblePoints} index={index} points={points} answer={answer}/>
        <Question questions={questions} index={index} answer={answer} dispatch={dispatch} />
        <NextButton numQuestions={numQuestions} index={index} answer={answer} dispatch={dispatch}/>
        </>
        }
        {status === "finished" && <FinishScreen points={points} highscore={highscore} dispatch={dispatch} maxPossiblePoints={maxPossiblePoints} />} 
      </Main>
    </div>
  );
}
