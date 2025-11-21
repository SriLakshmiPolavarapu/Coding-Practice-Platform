import {useNavigate} from "react-router-dom";

export default function QuestionItem({question}){
    const navigate = useNavigate();

    return (
        <div
        onClick={() => navigate(`/questions/${question.id}`)}
        style={{
            border:"1px solid #ccc",
            padding:"15px",
            margin:"10px 0",
            borderRadius:"8px",
            cursor:"pointer"
        }}
        >
            <h3>{question.title}</h3>
            <p>Difficulty:{question.difficulty}</p>
        </div>
    );
}