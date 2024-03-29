import React, {useState} from 'react';
import {socket} from '../components';
import {useNavigate, useLocation } from 'react-router-dom';

const EditQuiz = () => {
    
    const navigate = useNavigate();

    const location = useLocation();
    const nickname = location.state.nickname;
    console.log('nicknameEDITQUIZ: ', nickname);

    const now = new Date();
    const date = now.getFullYear() + '.' + (now.getMonth()+1) + '.' + now.getDate();

    const [quiz, setQuiz] = useState(location.state.quiz);
    const quizID = useState(location.state.quiz._id);
    console.log("id", location.state.quiz._id)
    const [title, setTitle] = useState(quiz.title);
    const [problems, setProblems] = useState(quiz.problems);
    const [inputs, setInputs] = useState({ newQuestion: '', newAnswer: '' });
    const { newQuestion, newAnswer } = inputs;
    const [textvisible, setTextVisible] = useState(false);

    // 퀴즈 제목 수정
    const onChangeTitle = (e) => { setTitle(e.target.value); }

    // 질문 수정
    const onChangeQuestion = (e) => {
        setProblems(
            problems.map((value, index) => {
                if (e.target.id === "question-" + String(index+1)) {
                    var selected_problem = problems[index];
                    selected_problem.question = e.target.value;
                    return {
                        ...value,
                        question: e.target.value,
                    };
                }
                return value;
            })
        );
    }

    // 답변 수정
    const onChangeOption = (e) => {  
        setProblems(
            problems.map((value, index) => {
                if (e.target.id === "answer-" + String(index+1)) {
                    var selected_problem = problems[index];
                    selected_problem.answer = e.target.value;
                    return {
                        ...value,
                        answer: e.target.value,
                    };
                }
                return value;
            })
        );
    }

    // 문제 삭제
    const onClickDelete = (e) =>{
        setProblems(problems.filter((value, index)=> e.target.id !== "problem-" + String(index+1))); 
    }


    // 새 문제/답변 입력
    const onChange = e => {
        const { name, value } = e.target; // e.target 에서 name 과 value 를 추출
        setInputs({
          ...inputs, // 기존의 input 객체를 복사한 뒤
          [name]: value // name 키를 가진 값을 value 로 설정
        });
    }

    // 문제 추가 버튼 클릭
    const onCreate = () => {
        // 입력값 확인 => 경고문구 show/hidden
        if(newQuestion=="" || newAnswer==""){
            setTextVisible(true);
            return;
        } else {
            setTextVisible(false);
        }
        var num = problems.length+1;
        setProblems((prev) => [
            ...prev,
            {
                question: newQuestion,
                answer: newAnswer,
                round: num
            }
        ]);
        setInputs({ newQuestion: '', newAnswer: '' });     
    };

    // 퀴즈 수정 완료 버튼 클릭
    const onSubmit = () =>{
        // 퀴즈이름 확인 => 경고창
        if(title==""){
            alert("퀴즈 이름을 입력하세요.");
            return;
        } 

        var checkInput = true;
        // 문제/정답 입력값 확인 => 경고창 or DB에 저장
        for(var i=0; i<problems.length; i++){
            if(problems[i].question=="" || problems[i].answer==""){
                alert("문제와 정답을 모두 입력하세요.");
                checkInput = false;
                break;
            }
        }

        if(checkInput==true){
            problems.map((value, index) => {
                value.round = index+1;
            });
    
            var newQuiz = {
                manager: quiz.manager,
                problem_num: problems.length,
                problems: problems,
                title: title,
                date: date
            }
            console.log('newQuiz:', newQuiz);
    
            // 기존 quiz 삭제
            socket.emit("drop_ID", quizID[0]); // ### socket으로 id 송신 ###
    
            // 새로운 quiz 추가
            socket.emit("quiz", newQuiz); // ### socket으로 서버에 폼에 입력한 데이터 송신 ###
    
            // 퀴즈 목록 페이지로 이동
            navigate("/dynamic-web_OXGame/managequiz", {state : {nickname : nickname}});           
        }       
    }

    // HOME 버튼 클릭 => HOME으로 이동
    const onClickHome = () => {
        navigate('/dynamic-web_OXGame',{state : {nickname : nickname}});
    }

    return (
        <div>
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container-fluid">
                <a class="navbar-brand" onClick={onClickHome}>HOME</a>
                </div>
            </nav>

            <br/><h1>EDIT QUIZ PAGE</h1><br/>
            <div>
                <table style={{margin: 'auto', width: '50%'}}>
                    <th style={{paddingTop: '1rem'}}>퀴즈 이름</th>
                    <td><input type="text" class="form-control" value={title} onChange={onChangeTitle}/></td>
                </table>
            </div>
            <br></br>
            

            <table class="table" style={{margin: 'auto', width: '80%'}}>
                <thead>
                    <tr class="table-primary">
                        <td>idx</td>
                        <td>Question</td>
                        <td>Answer</td>
                        <td>Function</td>
                    </tr>
                </thead>

                <tbody>
                    {problems.map((value, index) => (
                        <tr>
                            <td><label style={{padding: '0.5rem'}}>Q{index+1}</label></td>
                            <td><input name="question" class="form-control" style={{padding: '0.5rem'}} id={"question-"+String(index+1)} value={value.question} onChange={onChangeQuestion}/></td>
                            <td class="form-group">
                                <input type="radio" class="form-check-input" style={{margin: '0.5rem'}} id={"answer-"+String(index+1)} checked={value.answer==="true"} value="true"  name={"answer-"+String(index+1)} onClick={onChangeOption} /> <label style={{padding: '0.5rem'}}>O &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</label>
                                <input type="radio" class="form-check-input" style={{margin: '0.5rem'}} id={"answer-"+String(index+1)} checked={value.answer==="false"} value="false" name={"answer-"+String(index+1)} onClick={onChangeOption} /> <label style={{padding: '0.5rem'}}>X</label>
                            </td>
                            <td><button onClick={onClickDelete} id={"problem-"+String(index+1)} class="btn btn-secondary btn-sm" style={{margin: '0.5rem'}}>문제 삭제</button></td>
                        </tr>   
                    ))}
                    <tr>
                        <td></td>
                        <td><input class="form-control" style={{padding: '0.5rem'}} name="newQuestion" value={newQuestion} onChange={onChange}  /></td>
                        <td class="form-group">
                            <input type="radio" class="form-check-input" style={{margin: '0.5rem'}} value="true"  name="newAnswer" checked={newAnswer==='true'} onChange={onChange} /> <label style={{padding: '0.5rem'}}>O &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</label>
                            <input type="radio" class="form-check-input" style={{margin: '0.5rem'}} value="false" name="newAnswer" checked={newAnswer==='false'} onChange={onChange} /> <label style={{padding: '0.5rem'}}>X</label>
                        </td>
                        <td><button class="btn btn-outline-primary btn-sm" style={{margin: '0.5rem'}} onClick={onCreate}>문제 추가</button></td>
                    </tr>
                </tbody>
            </table>
            { textvisible ? <p class="text-danger">문제와 정답을 모두 입력하세요.</p> : null }

            <br/>
            <button class="btn btn-primary" onClick={onSubmit}>퀴즈 수정 완료</button>            
            
        </div>

    );
};

export default EditQuiz;