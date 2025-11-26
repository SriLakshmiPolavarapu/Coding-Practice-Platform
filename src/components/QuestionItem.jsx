import {useNavigate} from "react-router-dom";
import { useState } from "react";

export default function QuestionItem({question, isSolved}){
    const navigate = useNavigate();
    const [checked, setChecked] = useState(isSolved);

    //Set color
    const difficultyColor = {
        Easy: "green",                                                                                                                                                                                                                                                                                                    
        Medium: "orange",
        Hard: "red"
    };
    

    return (
        <div
        onClick={() => navigate(`/questions/${question.id}`)}
        style={{
            border:"1px solid #ccc",
            padding:"15px",
            margin:"10px 0",
            borderRadius:"8px",
            cursor:"pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}

    >
      {/* LEFT SIDE: Checkbox + Question Title */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          onClick={(e) => e.stopPropagation()} 
          style={{ marginRight: "10px" }}
        />

        <h3 style={{ margin: 0 }}>{question.title}</h3>
      </div>

      {/* RIGHT SIDE: Difficulty Tag */}
      <span
        style={{
          background: difficultyColor[question.difficulty],
          color: "white",
          padding: "5px 10px",
          borderRadius: "10px",
          fontSize: "0.9rem",
          marginLeft: "10px",
          whiteSpace: "nowrap"
        }}
      >
        {question.difficulty}
      </span>
    </div>
  );
}