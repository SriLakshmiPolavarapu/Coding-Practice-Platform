import{BrowserRouter, Routes, Route} from "react-router-dom";
import QuestionsPage from './pages/QuestionsPage.jsx';

export default function App()
{
    return(
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<QuestionsPage />}/>
            <Route path="/questions/:id" element={<div> this is screen 2</div>} />
        </Routes>
        </BrowserRouter>
    );
}