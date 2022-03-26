import React, { useState, useCallback, useRef, useEffect } from "react";
import { QuestionCircle } from 'react-bootstrap-icons';
import {
  Navbar, ThemeProvider, Row, Col, Container, Modal, Button, Form, Card, Tabs, Tab,
  Toast
} from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import BgImage from '../src/assets/img/Thoughts.png';
import ThoughtKeeper from './ThoughtKeeper';
import { MyThoughtsContext, WaitingThoughtsContext } from './context';
import { addThought, addRespeak } from './firebaseUtils';
import { labelForTimeSinceDate } from './utils';

function InfoDialog() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="outline" onClick={handleShow}>
        <QuestionCircle />
      </Button>

      <Modal show={show} onHide={handleClose} scrollable="true">
        <Modal.Header closeButton>
          <Modal.Title>Respeak</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Share your thoughts and help others reframe theirs.</p>
          <p>Write down what thoughts are burdening you at the moment, and click SEND. </p>
          <p>Afterward, help others reframe their thoughts. Can you find a different 
          perspective for their challenge? </p>
          {/* <p>For every 2 thoughts that you help reframe, you get one of your thoughts reframed. 
              And you can inspect the history of all the thoughts.</p> */}
          <hr></hr>
          <p>Example</p>
          <p>Thought:</p>
          <p><i>“I failed the math test today and I feel useless and so stupid.”</i></p>
          <p>Try to rephrase this. For example other people will help you rephrase it 
          with other perspectives:</p>
          <p><i>“I have not prepared enough for the math test. I have gone through many tests in my 
             life and succeeded. Next time I can prepare better. ”</i></p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function ThoughtsForm({onDone}) {
  const thoughtField = useRef();
  const submit = useCallback(async (e) => {
    e.preventDefault();
    await addThought(thoughtField.current.value);
    if (onDone) {
      onDone();
    }
  }, [thoughtField, onDone]);
  
  return(
    <Form onSubmit={submit}>
      <Form.Group className="mb-3" controlId="formBasicThought">
        <Form.Label>What's on your mind? </Form.Label>
        <Form.Control ref={thoughtField} as="textarea" placeholder="Enter thoughts here" rows="3" />
        <Form.Text className="text-muted">
          Hint: Just share what's burdening you atm. 
        </Form.Text>
      </Form.Group>
      <Button variant="dark" type="submit" style={{float: 'right'}}>
        SEND
      </Button>
    </Form>
  );
}

function ThoughtBubble({ thought }) {
  return (
    <div>
      <Row>
        <Col xs={2} />
        <Col xs={10}>
          <div className="shadow-sm mb-4 mt-4 br-4 p-3 bg-primary bg-gradient rounded text-white">
            {thought.content}
          </div>
        </Col>
      </Row>
    </div>
  );
}

function RespeakBubble({ respeak }) {
  return (
    <div className="mb-4 mt-4">
      <div>
        <Row>
          <Col xs={10}>
            <div className="shadow-sm mb-1 br-4 p-3 bg-success bg-gradient rounded text-white">
              {respeak.content}
            </div>
          </Col>
          <Col xs={2} />
        </Row>
      </div>
      <div className="text-muted">
        <small>{respeak.author}</small>
      </div>
    </div>
  );
}

function HistoryEntry({ thought }) {
  const [show, setShow] = useState(false);

  const handleClose = () => {
    thought.updated = false;
    return setShow(false);
  };

  const handleShow = () => setShow(true);

  return(
    <>
      <Container
        key={thought.id}
        className="shadow mb-4 mt-4 br-4 p-3 bg-white rounded" 
        onClick={handleShow}
        style={{cursor: 'pointer', userSelect: 'none'}}
      >
        <Container className="fs-4">{thought.content}</Container>
        <div className="fs-6">
          {/* <div style={{display: 'inline', width: 5, height: 5, background: 'blue'}} /> */}
          <span className="text-muted">{labelForTimeSinceDate(thought.createdAt.toDate())}</span>
          { thought.updated ? <span> • <b>Updated</b></span> : null }
        </div>
    </Container>
    
    <Modal show={show} onHide={handleClose}>
      <Modal.Body>
        <ThoughtBubble thought={thought} />
        {(thought.respeaks || []).map((r, i) => <RespeakBubble key={i} respeak={r} />)}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}

function HistoryPane() {
  return (
    <div style={{overflowX: 'visible'}}>
      <MyThoughtsContext.Consumer>
        {(myThoughts) =>
          myThoughts.map(thought => <HistoryEntry key={thought.id} thought={thought} />)
        }
      </MyThoughtsContext.Consumer>
    </div>
  )
}

function RespeakFormEntry({thoughtList}) {
  const [thought, setThought] = useState(null);
  const textField = useRef();

  useEffect(() => {
    setThought(thought => {
      if (thought === null && thoughtList.length > 0) {
        return thoughtList[0];
      }

      return thought;
    });
  }, [thoughtList]);
  
  const passRespeak = useCallback(async (e) => {
    e.preventDefault();

    
    if (thought === null) {
      if (thoughtList.length > 0) {
        setThought(thoughtList[0]);
      }
    } else {
      for (let i = 0; i < thoughtList.length; i++) {
        if (thoughtList[i].id !== thought.id) {
          setThought(thoughtList[i]);
        }
      }
    }
    await addRespeak(thought.id, textField.current.value, null);
    
    textField.current.value = "";
  }, [textField, thoughtList, thought]);

  if (!thought) {
    return null;
  }
    
  return (
    <Form onSubmit={passRespeak}>
      <Form.Group className="mb-3" controlId="formRespeak">
        <Form.Label>What's another perspective on the following: </Form.Label>
        <Card body border="warning" bg="warning">
          <i>{thought.content}</i>
        </Card>
        <br></br>
        <Form.Control
          as="textarea"
          ref={textField}
          placeholder="Can you identify some patterns? Are there any assumptions made without reason?"
          rows="3" />
      </Form.Group>
      <Button variant="dark" type="submit">
        Send
      </Button>
    </Form>);
}
    
function RespeakForm() {
  return(
    <WaitingThoughtsContext.Consumer>
      { value => {
        return <RespeakFormEntry thoughtList={value} />
      }
      }
    </WaitingThoughtsContext.Consumer>
  );
}

function App() {
  const [activeKey, setActiveKey] = useState("home");
  const [toastMessage, setToastMessage] = useState(null);

  const onThoughtDone = React.useCallback(() => {
    setActiveKey("respeak");
    setToastMessage("Please reframe a few other people's thoughts, while your thoughts are being reframed...");
  }, []);
  
  return (
    <ThoughtKeeper>
      <ThemeProvider>
        <Navbar bg="light">
          <Container>
            <Navbar.Brand href="#home">Respeak</Navbar.Brand>
            <InfoDialog /> 
          </Container>
        </Navbar>
        <Image src={BgImage} className='img-fluid w-100' alt='...' />
        {/* <Image src={Avatar}  style={{position: 'relative', height: '50%'}}/> */}
        <Container>
          <Row>
            <Col xs={2} />
            <Col xs={8}>
              <Tabs activeKey={activeKey}
                    onSelect={(eventKey) => setActiveKey(eventKey)}
                    id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="home" title="Thoughts">
                  <ThoughtsForm onDone={onThoughtDone} />
                </Tab>
                <Tab eventKey="respeak" title="Respeaks">
                  <RespeakForm />
                </Tab>
                <Tab eventKey="history" title="History">
                  <HistoryPane style={{maxHeight: '100%', overflowY: 'scroll'}}/>
                </Tab>
              </Tabs>
            </Col>
            <Col xs={2} />
          </Row>
          <Toast show={toastMessage !== null} onClose={() => setToastMessage(null)}>
            <Toast.Header>
              <strong>Thanks you!</strong>
            </Toast.Header>
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </Container>
    </ThemeProvider>
    </ThoughtKeeper>
  );
}

export default App;
