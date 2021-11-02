import { useState, useEffect, useRef } from 'react';
import { Navbar, NavbarBrand, Container, Row, Col, Input, Button } from 'reactstrap';
import axios from 'axios';
import { useHotkeys } from 'react-hotkeys-hook';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const regex = /(^[^\n]*'[^\n]*[\u2066\u2067\u2068][^'\u2069\n]*'[^\n]*$|^[^\n]*'[^\n]*[\u202A\u202B\u202D\u202E][^'\u202C\n]*'[^\n]*$|^[^\n]*"[^\n]*[\u2066\u2067\u2068][^"\u2069\n]*"[^\n]*$|^[^\n]*"[^\n]*[\u202A\u202B\u202D\u202E][^"\u202C\n]*"[^\n]*$|^[^\n]*\/\*[^\n]*[\u2066\u2067\u2068][^\u2069\n]*\*\/[^\n]*$|^[^\n]*\/\*[^\n]*[\u202A\u202B\u202D\u202E][^\u202C\n]*\*\/[^\n]*$|^[^\n]*\/\/[^\n]*[\u2066\u2067\u2068][^'\u2069\n]*$|^[^\n]*\/\/[^\n]*[\u202A\u202B\u202D\u202E][^'\u202C\n]*$|^[^\n]*#[^\n]*[\u2066\u2067\u2068][^'\u2069\n]*$|^[^\n]*#[^\n]*[\u202A\u202B\u202D\u202E][^'\u202C\n]*$)/gm;
const bidis = [['\u202C', 'PDF'],['\u202A', 'LRE'], ['\u202B', 'RLE'], ['\u202D', 'LRO'], ['\u202E', 'RLO'], ['\u2069', 'PDI'], ['\u2066', 'LRI'], ['\u2067', 'RLI'], ['\u2068', 'FSI'], ['\u200E', 'LRM'], ['\u061C', 'ALM']];

function matchLineNumber(m) {
  if (!m) {
    return -1
  }
  let line = 1
  for (let i = 0; i < m.index; i++) {
    if (m.input[i] === '\n') {
      line++;
    }
  }
  return line
}

function bidiCode(text) {
  let texts = (typeof(text) === "string" ? [text] : text) ?? [];
  for (var i=0; i<bidis.length; i++) {
    const [char, label] = bidis[i];
    for (var j=0; j<texts.length; j++) {
      const line = texts[j];
      if (typeof(line) === "string" && line.includes(char)) {
        let newLine = line.split(char);
        var k = 1;
        while (k < newLine.length) {
          newLine.splice(k, 0, <span className="bidi">{label}</span>);
          k += 2;
        }
        texts.splice(j, 1, ...newLine);
        return bidiCode(texts);
      }
    }
  }
  return <>
          {texts.map(x => typeof(x) === "string" ? <span>{x}</span> : x)}
         </>;
}

function App() {
  const chunksRef = useRef('');
  const requestRef = useRef(null);
  const [urls, setUrls] = useState([]);
  const [urlIndex, setUrlIndex] = useState(0);
  const [parsedCode, setParsedCode] = useState([]);
  useEffect(() => {
    if (requestRef.current !== null) {
      requestRef.current.destroy();
    }
    setUrlIndex((index) => Math.max(Math.min(index, urls.length-1), 0));
    if (urlIndex < urls.length) {
      chunksRef.current = '';
      setParsedCode([['', "Loading..."]]);
      (async () => {
        try {
          const response = await axios.get(urls[urlIndex]);
          let arr;
          let results = [];
          while ((arr = regex.exec(response.data)) !== null) {
              results.push([matchLineNumber(arr), arr[0]]);
          }
          if (results.length) {
            setParsedCode(results);
          }
          else if (urls.length) {
            setParsedCode([['', "No Bidi characters detected."]]);
          }
          else {
            setParsedCode([['','']]);
          }
        } catch (ex) {
          setParsedCode([['', "An error ocurred loading the requested URL."],
                         ['', ex.response.data]]);
        }
      })();
    }
    else {
      setParsedCode([['','']]);
    }
  }, [urls, urlIndex, setParsedCode]);
  const next = () => {
    setUrlIndex(Math.min(urlIndex+1, urls.length-1));
  };
  const prev =  () => {
    setUrlIndex(Math.max(urlIndex-1, 0));
  }
  useHotkeys('left', prev, {}, [urlIndex]);
  useHotkeys('right', next, {}, [urlIndex, urls]);
  return (
    <div className="App">
      <Navbar color="light" light expand="md">
        <Container>
          <NavbarBrand href="/">Bidi Viewer <small className="text-muted">- a tool for bulk-analyzing raw online code for Trojan Source attacks</small></NavbarBrand>
        </Container>
      </Navbar>
      <Container>
        <Row className="mt-4" style={{ height: '42vh' }}>
          <Col md={4} className="h-100">
            <Input type="textarea" placeholder="Enter newline-separated URLs pointing to code..." onChange={e => setUrls(e.target.value ? e.target.value.split("\n") : [])} style={{ height: '100%' }} />
          </Col>
          <Col md={8} className="code-area h-100">
            <h6 className="text-muted pt-3">Rendered Lines with Bidi Control Characters</h6>
            <hr />
            <code>
              {parsedCode.map(([lineNum, line]) => {
                if (lineNum === '') {
                  return <><span className="lineNum">{line}</span><br /></>
                } else {
                  return <><span className="lineNum">{lineNum}: </span><span>{line}</span><br /></>;
                }
              })}
            </code>
          </Col>
        </Row>
        <Row className="mt-2" style={{ height: '42vh' }}>
          <Col md={4} className="h-100">
            <div className="pt-4">{urls.length ? `${urlIndex+1}/${urls.length}` : '0/0'}</div>
            <div className="pt-4" style={{ minHeight: '30vh', wordWrap: 'break-word' }}>{urls ? <a href={urls[urlIndex]} target="_blank" rel="noreferrer">{urls[urlIndex]}</a> : 'No source selected.'}</div>
            <Button style={{ float: 'right', marginLeft: '10px' }} onClick={next} disabled={urlIndex >= urls.length-1}>&gt;</Button>
            <Button style={{ float: 'right' }} onClick={prev} disabled={urlIndex <= 0}>&lt;</Button>
          </Col>
          <Col md={8} className="code-area h-100">
            <h6 className="text-muted pt-3">Bidi Visualization</h6>
            <hr />
            <code>
              {parsedCode.map(([lineNum, line]) => {
                if (lineNum === '') {
                  return <><span className="lineNum">{line}</span><br /></>
                }
                else {
                  return <><span className="lineNum">{lineNum}: </span>{bidiCode(line)}<br /></>;
                }
              })}
            </code>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
