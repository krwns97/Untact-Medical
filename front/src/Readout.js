import React, { useEffect, useState } from "react"
import CanvasDraw from "react-canvas-draw"
import lung from "./resource/lung.jpg"
import kakao from "./resource/kakaotalk.png"
import {
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Button,
  Typography,
} from "@material-ui/core"
import { Container, Row, Col } from "react-bootstrap"
import qs from "query-string"
import axios from "axios"
import {useHistory} from "react-router-dom"
const config = require("./config")

const Img = ({ src }) => {
  return <img src={src} width={"100%"} />
}

const CD = ({ setSaveableCanvas, imgSrc, savedCanvas, index }) => {
  return (
    <CanvasDraw
      id='mycanvas'
      key={imgSrc}
      ref={(canvasDraw) => {
        setSaveableCanvas(canvasDraw)
        if (canvasDraw != null && savedCanvas[index])
          canvasDraw.loadSaveData(savedCanvas[index])
      }}
      brushRadius={1}
      brushColor='red'
      canvasWidth='100%'
      canvasHeight='100%'
      lazyRadius={0}
      imgSrc={imgSrc}
    />
  )
}

const Readout = ({ match, location }) => {
  const history = useHistory()
  const [value, setValue] = useState("정상")
  const [images, setImages] = useState([])
  const [predicts, setPredicts] = useState([])
  const [index, setIndex] = useState(0)
  const [patientName, setPatientName] = useState("")
  const [patientSex, setPatientSex] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [studyDate, setStudyDate] = useState("")
  const [modality, setModality] = useState("")
  const [studyDescription, setstudyDescription] = useState("")
  const id = qs.parse(location.search).id
  const [saveableCanvas, setSaveableCanvas] = useState({})
  const [savedCanvas, setSavedCanvas] = useState({})

  const [readText, setReadText] = useState("")

  const handleChange = (event) => {
    setValue(event.target.value)
  }
  const handleNext = () => {
    if (index + 1 < images.length) {
      const temp = {}
      temp[index] = saveableCanvas.getSaveData()
      setSavedCanvas({ ...savedCanvas, ...temp })
      setIndex(index + 1)
    }
    saveableCanvas.clear()
  }
  const handlePrior = () => {
    if (index - 1 >= 0) {
      const temp = {}
      temp[index] = saveableCanvas.getSaveData()
      setSavedCanvas({ ...savedCanvas, ...temp })
      setIndex(index - 1)
    }
    saveableCanvas.clear()
  }
  useEffect(() => {
    const help = async () => {
      console.log(id)
      const token = window.localStorage.getItem("token")
      const result = await axios.get(config.backURL + "/study/" + id, {
        headers: { Authorization: "bearer " + token },
      })
      console.log(result.data)
      const data = result.data
      setPatientName(data.PatientName)
      setPatientSex(data.PatientSex)
      setPatientAge(data.PatientAge)
      setStudyDate(data.StudyDate)
      setModality(data.Modality)
      setstudyDescription(data.StudyDescription)
      let res = []
      let res2 = []
      for (let i = 1; i <= data.NumberOfImg; i++) {
        res.push(
          config.backURL + "/show?dirName=" + data.StudyID + "&num=" + i
        )
        res2.push(
          config.backURL + "/show?dirName=" + data.StudyID + "&num=" + i + "&mode=predict"
        )
      }
      setImages(res)
      setPredicts(res2)
    }
    help()
  }, [])
  return (
    <Container>
      <Row>
        <Col>
          <Button variant='outlined' onClick={handlePrior}>
            <strong>이전</strong>
          </Button>
        </Col>
        <Col>
          <Button variant='outlined' onClick={handleNext}>
            <strong>다음</strong>
          </Button>
        </Col>
        <Col>
          <Button
            variant='outlined'
            onClick={() => {
              let temp = {}
              temp[index] = saveableCanvas.getSaveData()
              setSavedCanvas({
                ...savedCanvas,
                ...temp,
              })
            }}>
            <strong>(현재장)저장</strong>
          </Button>
        </Col>
        <Col>
          <Button
            variant='outlined'
            onClick={() => {
              saveableCanvas.clear()
            }}>
            <strong>초기화</strong>
          </Button>
        </Col>
        <Col>
          <Button
            variant='outlined'
            onClick={() => {
              saveableCanvas.undo()
            }}>
            <strong>되돌리기</strong>
          </Button>
        </Col>
        <Col>
          <Button
            variant='outlined'
            onClick={() => {
              if (savedCanvas[index])
                saveableCanvas.loadSaveData(savedCanvas[index])
            }}>
            <strong>불러오기</strong>
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          이미지 : {index + 1}/{images.length}
        </Col>
      </Row>
      <hr></hr>
      <Row xl={12} lg={12} md={12} sm={12} xs={12}>
        <Col xl={6} lg={6} md={6} sm={6} xs={6}>
          <Img src={predicts[index]} />
        </Col>
        <Col xl={6} lg={6} md={6} sm={6} xs={6}>
          <CD
            setSaveableCanvas={setSaveableCanvas}
            imgSrc={images[index]}
            savedCanvas={savedCanvas}
            index={index}
          />
        </Col>
      </Row>
      <hr></hr>
      <Row>
        <Col>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>판독 결과</FormLabel>
            <RadioGroup
              aria-label='gender'
              name='result'
              value={value}
              onChange={handleChange}>
              <FormControlLabel value='정상' control={<Radio />} label='정상' />
              <FormControlLabel value='이상' control={<Radio />} label='이상' />
            </RadioGroup>
          </FormControl>
        </Col>
        <Col>
          <TextField
            placeholder='소견'
            variant='outlined'
            multiline
            onChange={(e) => setReadText(e.target.value)}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            variant='outlined'
            onClick={async () => {
              const token = window.localStorage.getItem("token")
              const result = await axios.post(
                config.backURL + "/readout",
                {
                  studyId: id,
                  readText: readText,
                  readResult: value,
                  numberOfImg: images.length,
                  canvases: savedCanvas,
                },
                {
                  headers: { Authorization: "bearer " + token },
                }
              )
              console.log(result)
              if(result.status==200){
                alert("정상 제출됨!")
                history.push("/reader")
              }
            }}>
            <strong>판독 제출(완료)</strong>
          </Button>
        </Col>
        <Col></Col>
      </Row>
      <hr></hr>
      <Row>
        <Col>
          <FormLabel component='legend'>환자 정보</FormLabel>
        </Col>
      </Row>
      <Row>
        <Col>
          <Typography paragraph>이름 : {patientName}</Typography>
        </Col>
        <Col>
          <Typography paragraph>성별 : {patientSex}</Typography>
        </Col>
        <Col>
          <Typography paragraph>나이 : {patientAge}</Typography>
        </Col>
      </Row>
      <Row>
        <Col>
          <Typography paragraph>촬영일자 : {studyDate}</Typography>
        </Col>
        <Col>
          <Typography paragraph>검사장비 : {modality}</Typography>
        </Col>
        <Col>
          <Typography paragraph></Typography>
        </Col>
      </Row>
      <hr></hr>
      <Row>
        <Col>
          <FormLabel component='legend'>촬영 상세</FormLabel>
          <Typography paragraph>{studyDescription}</Typography>
        </Col>
        <Col>
          <FormLabel component='legend'></FormLabel>
          <Typography paragraph></Typography>
        </Col>
      </Row>
    </Container>
  )
}

export default Readout
