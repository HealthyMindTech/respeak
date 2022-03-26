import React, { useState, useCallback, useRef, useEffect } from "react";
import { QuestionCircle } from 'react-bootstrap-icons';
import {
  Navbar, ThemeProvider, Row, Col, Container, Modal, Button, Form, Card, Tabs, Tab,
  Toast, Badge
} from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import AvatarImage from '../src/assets/img/avatar_2_h.png';
import BgImage from '../src/assets/img/Thoughts.png';
import ThoughtKeeper from './ThoughtKeeper';
import { MyThoughtsContext, WaitingThoughtsContext } from './context';
import { addThought, addRespeak, getRespeaks } from './firebaseUtils';
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
    addThought(thoughtField.current.value);
    thoughtField.current.value = "";
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
      <Button variant="dark" type="submit">
        SEND
      </Button>
    </Form>
  );
}

function ThoughtModal({ thought }) {
  const [respeaks, setRespeaks] = useState([]);
  
  useEffect(() => {
    let running = true;
    async function f() {
      if (!running) return;
      const respeaks = await getRespeaks(thought.id);
      if (!running) return;
      setRespeaks(respeaks);
    }
    f();
    return () => { running = false; };
  }, [thought]);

  return (
    <>
      <ThoughtBubble thought={thought} />
      { respeaks.map(r => <RespeakBubble key={r.id} respeak={r} />) }
    </>
  );
}

function ThoughtBubble({ thought }) {
  return (
    <Container>
      <Row>
        <Col xs={2} />
        <Col xs={10}>
          <Container className="shadow-sm mb-4 mt-4 br-4 p-3 bg-primary bg-gradient rounded text-white">
            {thought.content}
            <div className="fs-6">
            {/* <div style={{display: 'inline', width: 5, height: 5, background: 'blue'}} /> */}
            <span className="text-white-50">{labelForTimeSinceDate(thought.createdAt.toDate())}</span>
            { thought.updated ? <span> • <b>Updated</b></span> : null }
          </div>
          </Container>
        </Col>
      </Row>
    </Container>
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
              <div className="fs-6">
                {/* <div style={{display: 'inline', width: 5, height: 5, background: 'blue'}} /> */}
                <span className="text-white-50">{labelForTimeSinceDate(respeak.createdAt.toDate())}</span>
                { respeak.updated ? <span> • <b>Updated</b></span> : null }
              </div>
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
  const [showNewItemsBadge, setShowNewItemsBadge] = useState(true);

  const handleClose = () => {
    thought.updated = false;
    return setShow(false);
  };

  const handleShow = () => {
    setShow(true);
    setShowNewItemsBadge(false);
  };

  return(
    <>
      <Container
        key={thought.id}
        className="shadow mb-4 mt-4 br-4 p-3 bg-white rounded" 
        onClick={handleShow}
        style={{cursor: 'pointer', userSelect: 'none'}}
      >
        { showNewItemsBadge ?
          (<div className="fs-5" style={{float: 'right'}}>
          <Badge pill bg="success">
            {thought.numRespeaks}
          </Badge>
        </div>) : null }
        <Container className="fs-4">
          {thought.content}
        </Container>
        <div className="fs-6">
          {/* <div style={{display: 'inline', width: 5, height: 5, background: 'blue'}} /> */}
          <span className="text-muted">{labelForTimeSinceDate(thought.createdAt.toDate())}</span>
          { thought.updated ? <span> • <b>Updated</b></span> : null }
        </div>
    </Container>
    
    <Modal show={show} onHide={handleClose}>
      <Modal.Body>
        <ThoughtModal thought={thought} />
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
      <p>Here you can see your past thoughts and their answers.</p>
      <MyThoughtsContext.Consumer>
        {(myThoughts) => {
          if (myThoughts.length === 0) return <p>You have not written any thoughts yet.</p>
          return myThoughts.map(thought => <HistoryEntry key={thought.id} thought={thought} />);
        }
        }
      </MyThoughtsContext.Consumer>
    </div>
  )
}

function RespeakFormEntry({thoughtList, onDone}) {
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
  
  const passRespeak = useCallback((e) => {
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
    addRespeak(thought.id, textField.current.value, null);
    
    textField.current.value = "";
    if (onDone) {
      onDone();
    }
  }, [textField, thoughtList, thought, onDone]);

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
    
function RespeakForm({onDone}) {
  return(
    <WaitingThoughtsContext.Consumer>
      { value => (<RespeakFormEntry onDone={onDone} thoughtList={value} />) }
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

  const onRespeakDone = React.useCallback(() => {
    setActiveKey("thought");
    setToastMessage("You have respoken on another person's thought. Send more thoughts?");
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
        <Container
          fluid
          style={
            {
              display: 'grid',
              gridTemplateColumns: '1fr 180px 1fr',
              gridTemplateRows: '1fr 2fr 1fr',
              height: '50vh',
              backgroundImage: `url(${BgImage})`,
              backgroundRepeat: 'no-repeat'
            }
          }
          className='p-0'>
          {/* <Image src={BgImage} className='img-fluid w-100 p-0 m-0' alt='...' /> */}
          <Container className="column" style={{ gridColumn: '2 / span 1', gridRow: '2 / span 1', background: '#fff', textAlign: 'center', verticalAlign: 'middle' }}>
            <Image src={AvatarImage} />
            <h2>Username</h2>
          </Container>
        </Container>
        {/* <Image src={Avatar}  style={{position: 'relative', height: '50%'}}/> */}
        <Container>
          <Row>
            <Col xs={2} />
            <Col xs={8}>
              <Tabs activeKey={activeKey}
                    onSelect={(eventKey) => setActiveKey(eventKey)}
                    id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="home" title="Speak">
                  <ThoughtsForm onDone={onThoughtDone} />
                </Tab>
                <Tab eventKey="respeak" title="Respeak">
                  <RespeakForm onDone={onRespeakDone} />
                </Tab>
                <Tab eventKey="thought" title="Thoughts">
                  <HistoryPane style={{maxHeight: '100%', overflowY: 'scroll'}}/>
                </Tab>
              </Tabs>
            </Col>
            <Col xs={2} />
          </Row>
          <Toast show={toastMessage !== null} onClose={() => setToastMessage(null)}>
            <Toast.Header>
              <strong>Thank you!</strong>
            </Toast.Header>
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </Container>
    </ThemeProvider>
    </ThoughtKeeper>
  );
}

export default App;
