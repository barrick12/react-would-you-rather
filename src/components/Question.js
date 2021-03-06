import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Panel, FormGroup, Radio, Button, ListGroup, ListGroupItem, ProgressBar, Badge } from 'react-bootstrap'
import { formatQuestion } from '../utils/helpers'
import { handleOnSubmitQuestionAnswer } from '../actions/questions'
import Cookies from 'js-cookie'
import { withRouter } from 'react-router-dom'

class Question extends Component{   

    handleOnSubmitQuestionAnswer = (e) => {
        e.preventDefault();

        const{dispatch, authedUser, question } = this.props;

        if (!document.querySelector('[name="radioGroup"]:checked')) { return null;}       
        var token = Cookies.get('id');
        dispatch(handleOnSubmitQuestionAnswer({
            authedUser: authedUser,
            qid: question.id,
            answer: document.querySelector('[name="radioGroup"]:checked').value
        }, token))
    }

    questionPreview(testStr){
        var pos = 0, n = 3;
        pos = testStr.indexOf(" ");

        while (--n > 0 && pos !== -1)
            pos = testStr.indexOf(" ", pos + 1);

        if (pos === -1) { return testStr}
        else return testStr.substr(0,pos);
    }

    render(){
        const { question } = this.props;

        if (!question) { return (<h4><b>404 Page Not Found</b></h4>);}

        var votingResult;
        if (question.voted && this.props.isHome === "false" ) {

            var progress = Math.floor(100 * question.optionOneVotes/question.totalVotes);
            var complProgress = 100 - progress;
            var userVote = (
                <div style={{textAlign:'right'}}><Badge >Your Vote!</Badge></div>
            )

            var questionOne = (
                <span>
                    {question.chosenVote === "optionOne" && userVote}
                    {question.optionOneText}
                    <ProgressBar striped bsStyle="success" now={progress} label={`${progress}%`} className="progressBar"/>
                    <div className='numberOfVotesText'>{question.optionOneVotes} out of {question.totalVotes} votes</div>
                </span>
            );

            var questionTwo = (
                <span>
                    {question.chosenVote === "optionTwo" && userVote}
                    {question.optionTwoText}
                    <ProgressBar striped bsStyle="success" now={complProgress} label={`${complProgress}%`} className="progressBar"/>
                    <div className='numberOfVotesText'>{question.optionTwoVotes} out of {question.totalVotes} votes</div>
                </span>
            );

            if (question.optionOneVotes > question.optionTwoVotes) {
                votingResult = (
                    <span>
                        <ListGroupItem bsStyle="success" className="listGroupItemBody">
                            {questionOne}
                        </ListGroupItem>
                        <ListGroupItem className="listGroupItemBody">
                            {questionTwo}
                        </ListGroupItem>

                    </span>
            )}
            else if (question.optionOneVotes < question.optionTwoVotes) {
                votingResult = (
                    <span>
                        <ListGroupItem className="listGroupItemBody">
                            {questionOne}
                        </ListGroupItem>
                        <ListGroupItem bsStyle="success" className="listGroupItemBody">
                            {questionTwo}
                        </ListGroupItem>
                    </span>
            )}
            else {
                votingResult = (
                    <span>
                        <ListGroupItem className="listGroupItemBody">
                            {questionOne}
                        </ListGroupItem>
                        <ListGroupItem className="listGroupItemBody">
                            {questionTwo}
                        </ListGroupItem>
                    </span>
            )}
        }

        var questionObj = (
            <Panel className="questionPanel">
                    <Panel.Heading>
                    { (question.voted && this.props.isHome === "false") ?
                        (<b>Asked by {question.name}</b>)
                        : ( <b>{question.name} asks:</b>)
                    }
                    </Panel.Heading>
                    <Panel.Body className="questionBody">
                        <img
                            src={ require( `../assets/${question.avatar}` )}
                            alt={`Avatar of ${question.name}`}
                            className='avatar'
                        />
                        { (question.voted && this.props.isHome === "false") ?
                            (<ListGroup>
                                    <h2 className='questionResultsHeader'>Results</h2>
                                    {votingResult}
                            </ListGroup>)
                            :
                            ( this.props.isHome === "false" ) ?
                                (<FormGroup>
                                    <Radio name="radioGroup" value="optionOne">
                                        {question.optionOneText}
                                    </Radio>
                                    <Radio name="radioGroup" value="optionTwo">
                                        {question.optionTwoText}
                                    </Radio>
                                    <Button type="submit" className="submitBtn" onClick={this.handleOnSubmitQuestionAnswer}>Submit</Button>
                                </FormGroup>)
                                :
                                (<FormGroup>
                                    <div><b>Would You Rather</b></div>
                                    <br/>
                                    <div>...{this.questionPreview(question.optionOneText)}...</div>
                                    <br/>                                
                                    <Button type="submit" className="submitBtn"
                                        onClick={()=>{                                        
                                            this.props.history.push('/home/questions/' + question.id);
                                    }}>
                                        View Poll
                                    </Button>
                                </FormGroup>)
                        }
                    </Panel.Body>
                </Panel>                
        );

        var result = this.props.isHome === "false" ? <div className='flexContainerRowCenter'>{questionObj}</div> : (questionObj);

        return(result);                
     }
}

function mapStateToProps({authedUser, users, questions}, props) {

    var param = props.id? props.id : props.location.pathname.slice(16);

    const question = questions.filter( (question)=> question._id == param )[0];
    
    var usersArray = [];
    for(var i in users)
        usersArray.push(users[i]);
    
    const author = !question ? [] : usersArray.filter(user => user._id == question.author)[0];

    return {
        authedUser,
        question: question
        ? formatQuestion(question, author, authedUser)
        : null,
    }
}

export default withRouter(connect(mapStateToProps)(Question))
