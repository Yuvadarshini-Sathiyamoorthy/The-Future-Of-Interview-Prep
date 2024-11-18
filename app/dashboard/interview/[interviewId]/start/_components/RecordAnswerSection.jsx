"use client"
import { toast } from "sonner";
import { useEffect, useState } from 'react';
import { Image, Mic, StopCircle } from 'lucide-react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { chatSession } from "@/utils/GeminiAIModal";
import { useUser } from "@clerk/nextjs";
function RecordAnswerSection({mockInterviewQuestion, activeQuestionIndex, interviewData}) {
  const [userAnswer,setUserAnswer]=useState('');
  const {user}=useUser();
  const [loading,setLoading]=useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  useEffect(()=>{
    results.map((result) => (
      setUserAnswer(prevAns=>prevAns+result?.transcript)
  ))
  },[results])


  useEffect(()=>{
    if(!isRecording&&userAnswer.length>10){
      UpdateUserAnswer();
    }
    
  }, [userAnswer])

  const StartStopRecording=async()=>{
    if(isRecording)
    {
      
      stopSpeechToText()
      
    }

    else{
      startSpeechToText();
    }
  }

  const UpdateUserAnswer=async()=>{
    console.log(userAnswer)
    setLoading(true);
    const feedbackPrompt="Question: "+mockInterviewQuestion[activeQuestionIndex]?.question+
      ", User Answer: "+userAnswer+", Depending on question and user answer for given interview question"+
      "please give us rating for answer and feedback as area of improvement if any"+
      "in just 3 to 5 lines to improve it in JSON formatwith rating field and feedback field";

      const result=await chatSession.sendMessage(feedbackPrompt);

      const mockJsonResp=(result.response.text()).replace('```json','').replace('```','');
      console.log(mockJsonResp)
      const JsonFeedbackResp=JSON.parse(mockJsonResp);

      const resp=await db.insert(userAnswer)
      .values({
        mockIdRef: interviewData?.mockId,
       question: mockInterviewQuestion[activeQuestionIndex]?.question,
       correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
       userAns: userAnswer,
       feedback: JsonFeedbackResp?.feedback,
       rating: JsonFeedbackResp?.rating,
       userEmail: user?.primaryEmailAddress?.emailAddress,
       createdAt: moment().format('DD-MM-yyyy')
      })
       
      if(resp)
      {
        toast('Answer Recorded Successfully')
        setUserAnswer('');
        setResults([]);
      }
      setResults([]);
      setLoading(false);
  }

  return (
    <div className='flex items-center justify-center flex-col'>
      <div className='flex flex-col mt-20 justify-center items-center bg-black bg-secondary rounded-lg p-5'>
        <Image src={'/webcam.png'} width={200} height={200}
        className='absolute'/>
        <Webcam
        mirrored={true}
        style={{
          height:300,
          width:'100%',
          zIndex:10,
        }}
        />

      </div>
      <button 
      disabled={loading}
      variable="outline" className="my-10"
      onClick={StartStopRecording}> 
        {isRecording?
        <h2 className='text-red-600 flex gap-2'>
          <StopCircle/> Stop Recording
        </h2>

        :
        
        <h2 className='text-primary flex gap-2 items-center'>
          <Mic/> Record Answer</h2>  

        }</button>

      

    </div>
  )
}

export default RecordAnswerSection
