import React, { useState, useCallback, useRef, useEffect } from "react";
import { QuestionCircle, ChatSquareText, ChatRightHeart, JournalBookmarkFill } from 'react-bootstrap-icons';
import {
  Navbar, ThemeProvider, Row, Col, Container, Modal, Button, Form, Tabs, Tab,
  Toast, Badge, ToastContainer, Card
} from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import AvatarImage from '../src/assets/img/avatar_2_h.png';
import BgImage from '../src/assets/img/Thoughts.png';
import ThoughtKeeper from './ThoughtKeeper';
import { MyThoughtsContext, WaitingThoughtsContext } from './context';
import { addThought, addRespeak, getRespeaks, noteSeenRespeaks } from './firebaseUtils';
import { labelForTimeSinceDate } from './utils';
import './index.css';

const PROMPT = [
  "How would you think about this statement in 10 years? What would you focus on?",
  "How would you describe this thought as a positive one?",
  "What is this person thinking this way? Try asking yourself \"why\" until you find the root cause.",
  "Is this thought intense emotionally? How would you write it after \"cooling down\"?",
  "What emotions are involved in the thought? Name them.",
  "What part of this thought is under control of this person and what is outside of their control?",
  "Can you identify some patterns? Are there any assumptions made without reason?"
];

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
          <p>Afterwards, help others reframe their thoughts. Can you find a different
          perspective for their challenge? </p>
          {/* <p>For every 2 thoughts that you help reframe, you get one of your thoughts reframed.
              And you can inspect the history of all the thoughts.</p> */}
          <hr></hr>
          <p>Example thought:</p>
          <Card>
            <Card.Body><i>I failed the math test today and I feel useless and so stupid.</i></Card.Body>
          </Card>
          <p><i></i></p>
          <p>Try to rephrase this. For example other people will help you rephrase it
          with other perspectives:</p>
          <Card>
            <Card.Body><i>I have not prepared enough for the math test. I have gone through many tests in my
             life and succeeded. Next time I can prepare better.</i></Card.Body>
          </Card>
          <hr></hr>
          <p style={{fontSize: "10px"}}>Note: This solution is not intended to be used for any medical purpose. Please contact your medical
            professional if you have any questions about your health.</p>
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
          <Form.Control required ref={thoughtField} as="textarea" placeholder="Enter thoughts here" rows="3" />
        <Form.Text className="text-muted">
          Hint: Just share what's burdening you atm.
        </Form.Text>
      </Form.Group>
      <Button variant="dark" type="submit">
        Send
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
          <Container className="shadow-sm mb-4 mt-4 br-4 p-3 bg-primary bg-gradient text-white" style={{ borderRadius: '15px' }}>
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
            <div className="shadow-sm mb-1 br-4 p-3 bg-success bg-gradient text-white" style={{ borderRadius: '15px' }}>
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
    </div>
  );
}

function HistoryEntry({ thought }) {
  const [show, setShow] = useState(false);

  const handleClose = useCallback(() => {
    return setShow(false);
  }, []);

  const handleShow = useCallback(() => {
    setShow(true);
    noteSeenRespeaks(thought.id, thought.notSeenRespeaks);
  }, [thought]);

  return(
    <>
      <Container
        key={thought.id}
        className="mb-4 mt-4 br-4 p-3 bg-white"
        onClick={handleShow}
        style={
          {
            cursor: 'pointer',
            userSelect: 'none',
            borderRadius: '15px',
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'
          }
        }>

        { thought.notSeenRespeaks ?
          (<div className="fs-5" style={{float: 'right'}}>
            <Badge pill bg="info">
              {thought.notSeenRespeaks}
            </Badge>
           </div>) : null
        }
        <Container className="fs-6 p-0">
          {thought.content}
        </Container>
        <div className="small">
          {/* <div style={{display: 'inline', width: 5, height: 5, background: 'blue'}} /> */}
          <span className="text-muted">{labelForTimeSinceDate(thought.updatedAt.toDate())}</span>
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
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const textField = useRef();
  const [prompt, setPrompt] = useState(Math.floor(Math.random() * PROMPT.length));

  useEffect(() => {
    setThought(thought => {
      if (thoughtList.length > 0) {
        return thoughtList[thoughtIndex];
      }

      return thought;
    });
  }, [thoughtList, thoughtIndex]);

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
    setPrompt(Math.floor(Math.random() * PROMPT.length));

    textField.current.value = "";
    if (onDone) {
      onDone();
    }
  }, [textField, thoughtList, thought, onDone]);

  if (!thought) {
    return null;
  }
  console.log(thoughtList);
  return (
    <Form onSubmit={passRespeak}>
      <Form.Group className="mb-3" controlId="formRespeak">
        <Form.Label>Please put a different perspective on the thought below.</Form.Label>
        <Container
          className="shadow mb-4 mt-2 br-3 p-3 bg-white"
          style={{borderRadius: '15px'}}
        >
          <Container className="fs-6 p-0">
            {thought.content}
          </Container>
        </Container>
        <Form.Control
          required
          as="textarea"
          ref={textField}
          placeholder="What's another perspective on the thought above?"
          rows="3" />
        <Form.Text className="text-muted">
          Hint: {PROMPT[prompt]}
        </Form.Text>
      </Form.Group>
      <Button variant="dark" type="submit">
        Send
      </Button>
      <Button variant="link" style={{float: "right"}} onClick={() => setThoughtIndex((i) => {return i === thoughtList.length - 1 ? 0 : i + 1})}>
        Get another Thought
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

function HistoryTabTitle() {
  return (
  <MyThoughtsContext.Consumer>
    {(myThoughts) => {
      const newThoughts = myThoughts.reduce((acc, thought) => {
        return acc + thought.notSeenRespeaks;
      }, 0);
      return (<>
        <div style={{width: 0, height: 0, position: "relative"}}>
          { newThoughts > 0 ? <span className="fs-6" style={{position: "relative", left: 51, top: 12}}>
          <Badge pill bg="info"> {newThoughts}</Badge></span> : null}
        </div>
        <JournalBookmarkFill size={28}/>
          <div class="fs-4">Thoughts</div>
      </>)
    }}
  </MyThoughtsContext.Consumer>
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
    setActiveKey("home");
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
        <ToastContainer position="top-center">
          <Toast show={toastMessage !== null} onClose={() => setToastMessage(null)} delay={5000} autohide>
            <Toast.Header>
              <strong>Thank you!</strong>
            </Toast.Header>
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
        <Container fluid className="p-0 m-0" style={{ backgroundImage: `url(${BgImage})`, backgroundRepeat: 'no-repeat' }}>
          <Container
            fluid
            style={
              {
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr',
                gridTemplateRows: '1fr 2fr 2fr',
                height: '50vh',
              }
            }
            className='p-0'>
            <Container className="column" style={{ gridColumn: '2 / span 1', gridRow: '2 / span 1', textAlign: 'center' }}>
              <Image src={AvatarImage} style={{margin: '0 auto'}}/>
            </Container>
          </Container>

          <Container fluid style={{
            background: "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 95%, rgba(255,255,255,0) 100%)",
          }}>
            <Row style={{ paddingTop: '.7rem' }} >
              <Col xl={4} lg={3} md={2} xs={1} />
              <Col xl={4} lg={6} md={8} xs={10}>
                <Tabs activeKey={activeKey}
                  onSelect={(eventKey) => setActiveKey(eventKey)}
                  id="uncontrolled-tab-example" className="mb-3 justify-content-center">
                  <Tab eventKey="home" title={<><ChatSquareText size={28}/><div class="fs-4">Speak</div></>}>
                    <ThoughtsForm onDone={onThoughtDone} />
                  </Tab>
                  <Tab eventKey="respeak" title={<><ChatRightHeart size={28}/><div class="fs-4">Respeak</div></>}>
                    <RespeakForm onDone={onRespeakDone} />
                  </Tab>
                  <Tab eventKey="thought" title={<HistoryTabTitle/>}>
                    <HistoryPane style={{ maxHeight: '100%', overflowY: 'scroll' }} />
                  </Tab>
                </Tabs>
              </Col>
              <Col xl={4} lg={3} md={2} xs={1} />
            </Row>
          </Container>
        </Container>
      </ThemeProvider>
    </ThoughtKeeper>
  );
}

export default App;
