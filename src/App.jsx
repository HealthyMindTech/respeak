import React, { useState, useCallback, useRef } from "react";
import { QuestionCircle } from 'react-bootstrap-icons';
import {Navbar, ThemeProvider, Row, Col, Container, Modal, Button, Form, Card, Tabs, Tab} from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import BgImage from '../src/assets/img/Thoughts.png';
import ThoughtKeeper from './ThoughtKeeper';

import { addThought } from './firebaseUtils';

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

function ThoughtsForm() {
  const thoughtField = useRef();
  const submit = useCallback((e) => {
    e.preventDefault();
    addThought(thoughtField.current.value);
  }, [thoughtField]);
  
  return(
    <Form onSubmit={submit}>
      <Form.Group className="mb-3" controlId="formBasicThought">
        <Form.Label>What's on your mind?</Form.Label>
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
      <div
        key={thought.id}
        className="shadow mb-4 mt-4 br-4 p-3 bg-white rounded" 
        onClick={handleShow}
        style={{cursor: 'pointer', userSelect: 'none'}}>
        <div className="fs-4">{thought.content}</div>
        <div className="fs-6">
          {/* <div style={{display: 'inline', width: 5, height: 5, background: 'blue'}} /> */}
          <span className="text-muted">{thought.createdAt}</span>
          { thought.updated ? <span> • <b>Updated</b></span> : null }
        </div>
    </div>

    <Modal show={show} onHide={handleClose}>
      <Modal.Body>
        <ThoughtBubble thought={thought} />
        {thought.respeaks.map((r, i) => <RespeakBubble key={i} respeak={r} />)}
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
  const [thoughts] = useState([
    {
      content: "I'm depressed",
      createdAt: "1y",
      updated: false,
      respeaks: [],
      id: 1,
    },
    {
      content: "No hope for me",
      createdAt: "2w",
      updated: true,
      respeaks: [
        {
          author: 'someone else',
          content: 'Hey, I have some other perspectives on this. I really think you should get up and going. Life is beautiful.',
          createdAt: '2w',
        },
        {
          author: 'some stranger',
          content: 'Hey, here are my thoughts on this issue.',
          createdAt: '3w',
        },
      ],
      id: 2,
    },
    {
      content: "I need help",
      createdAt: "11h",
      updated: false,
      respeaks: [],
      id: 3,
    },
    {
      content: "I'm depressed",
      createdAt: "3w",
      updated: true,
      respeaks: [
        {
          author: 'someone else',
          content: 'Hey, I have some other perspectives on this. I really think you should get up and going. Life is beautiful.',
          createdAt: '2w',
        },
        {
          author: 'some stranger',
          content: 'Hey, here are my thoughts on this issue.',
          createdAt: '3w',
        },
      ],
      id: 4
    },
    {
      content: "No hope for me",
      createdAt: "2m",
      updated: false,
      respeaks: [],
      id: 5
    },
    {
      content: "I need help",
      createdAt: "6m",
      updated: false,
      respeaks: [],
      id: 6
    },
  ]);

  thoughts.sort((a, b) => {
    if (a.updated) {
      return -1;
    } else if (b.updated) {
      return 1;
    } else {
      return a.createdAt < b.createdAt ? -1 : 1;
    }
  });

  return (
    <div style={{overflowX: 'visible'}}>
      {thoughts.map((t, i) => <HistoryEntry key={i} thought={t} />)}
    </div>
  )
}

function RespeakForm() {
  return(
    <Form>
      <Form.Group className="mb-3" controlId="formRespeak">
        <Form.Label>What's another perspective on the following: </Form.Label>
        <Card body border="warning" bg="warning">
          <i>I feel like I am always being stupid and nobody is helping me. 
          I am not smart enough. </i>
        </Card>
        <br></br>
        <Form.Control as="textarea" placeholder="Can you identify some patterns? 
      Are there any assumptions made without reason?" rows="3" />
        
      </Form.Group>
      <Button variant="dark" type="submit" style={{float: 'right'}}>
        SEND
      </Button>
    </Form>
  );
}

function App() {
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
              <Tabs defaultActiveKey="history" id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="home" title="Thoughts">
                  <ThoughtsForm/>
                </Tab>
                <Tab eventKey="profile" title="Respeaks">
                  <RespeakForm />
                </Tab>
                <Tab eventKey="history" title="History">
                  <HistoryPane style={{maxHeight: '100%', overflowY: 'scroll'}}/>
                </Tab>
              </Tabs>
            </Col>
            <Col xs={2} />
          </Row>
        </Container>
    </ThemeProvider>
    </ThoughtKeeper>
  );
}

export default App;
