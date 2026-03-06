import { useState, useEffect, useRef, useCallback } from "react";

const MILESTONES = [1,3,7,14,30,60,90,180,365];
const MILESTONE_NAMES = {1:"First Day",3:"Three Days",7:"One Week",14:"Two Weeks",30:"One Month",60:"Two Months",90:"Three Months",180:"Half a Year",365:"One Full Year"};
const MILESTONE_ICONS = {1:"🌅",3:"🕊",7:"🌤",14:"✨",30:"🌸",60:"💚",90:"🌱",180:"🌿",365:"🌳"};

const MOODS = [
  {emoji:"😔",label:"Struggling",color:"#c0392b"},
  {emoji:"😟",label:"Hard",color:"#e67e22"},
  {emoji:"😐",label:"Neutral",color:"#95a5a6"},
  {emoji:"🙂",label:"Okay",color:"#27ae60"},
  {emoji:"😊",label:"Good",color:"#2ecc71"},
  {emoji:"🌟",label:"Thriving",color:"#f1c40f"},
];

const BREATHING_PHASES = [
  {label:"Breathe In",duration:4,color:"#4a9d7a"},
  {label:"Hold",duration:4,color:"#c9a84c"},
  {label:"Breathe Out",duration:6,color:"#6b8cba"},
  {label:"Hold",duration:2,color:"#a87aaa"},
];

const AFFIRMATIONS = [
  "Every moment you choose yourself, you rewrite your story.",
  "Your strength lives precisely in the spaces between craving and choice.",
  "This discomfort is temporary. The person you're becoming is permanent.",
  "You are not what happened to you. You are what you choose to do next.",
  "Recovery is not a straight line — it's a spiral upward.",
  "The bravest thing you did today was wake up and try again.",
];

const TRIGGERS = ["Stress","Social pressure","Loneliness","Boredom","Anxiety","Celebration","Anger","Fatigue","Habit","Other"];

const INITIAL_MESSAGES = [
  {id:1,from:"Mom",initials:"M",color:"#c9a84c",text:"I think about your courage every single morning. You are doing something extraordinary and I see it.",hasAudio:true,duration:"0:38",audioUrl:null,ts:Date.now()-3600000*2},
  {id:2,from:"Alex",initials:"A",color:"#6b8cba",text:"Hey. Just wanted to say I'm proud of you. No agenda, just that. You've got this completely.",hasAudio:true,duration:"0:22",audioUrl:null,ts:Date.now()-3600000*18},
  {id:3,from:"Jordan",initials:"J",color:"#7a9a6a",text:"Every sober morning is a small miracle. I'm honoured to witness yours.",hasAudio:false,duration:null,audioUrl:null,ts:Date.now()-86400000*2},
];

const INITIAL_CRAVINGS = [
  {id:1,trigger:"Stress",intensity:7,note:"Went for a 20-min walk, felt better after",ts:Date.now()-3600000*5,overcome:true},
  {id:2,trigger:"Social pressure",intensity:5,note:"Left the situation early",ts:Date.now()-86400000,overcome:true},
  {id:3,trigger:"Boredom",intensity:4,note:"Called a friend instead",ts:Date.now()-86400000*3,overcome:true},
];

const INITIAL_JOURNAL = [
  {id:1,text:"Woke up feeling grateful today. The morning light felt different — more present, somehow.",ts:Date.now()-86400000,mood:4},
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#0a1a14; --bg2:#0f2218; --bg3:#142d20;
    --card:#15261e; --card2:#1a2e22;
    --gold:#c9a84c; --gold2:#e8c96a; --gold-dim:#8a7235;
    --green:#4a9d7a; --green2:#6ab89a; --green-dim:#2d5e49;
    --cream:#f0e8d8; --cream2:#d4c8b4; --cream3:#8a7e6e;
    --red:#c9584a; --blue:#6b8cba; --lavender:#9a7ab8;
    --border:rgba(201,168,76,0.15); --border2:rgba(240,232,216,0.08);
    --shadow:0 8px 40px rgba(0,0,0,0.5);
    --r:20px; --r-sm:12px; --r-xs:8px;
  }
  body{background:var(--bg);color:var(--cream);font-family:'DM Sans',sans-serif;}
  input,textarea,select{font-family:'DM Sans',sans-serif;}
  input[type=range]{-webkit-appearance:none;appearance:none;height:6px;border-radius:50px;background:var(--bg3);outline:none;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--gold);cursor:pointer;box-shadow:0 0 8px rgba(201,168,76,0.5);}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:none}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
  @keyframes spinRing{from{stroke-dashoffset:283}to{stroke-dashoffset:0}}
  @keyframes breatheIn{from{transform:scale(0.6);opacity:0.5}to{transform:scale(1);opacity:1}}
  @keyframes breatheOut{from{transform:scale(1);opacity:1}to{transform:scale(0.6);opacity:0.5}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
  @keyframes confetti{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(201,168,76,0.3)}50%{box-shadow:0 0 40px rgba(201,168,76,0.7)}}
  @keyframes recordPulse{0%,100%{box-shadow:0 0 0 0 rgba(201,80,74,0.5)}50%{box-shadow:0 0 0 16px rgba(201,80,74,0)}}
  .anim-fadeUp{animation:fadeUp 0.5s ease forwards;}
  .anim-scaleIn{animation:scaleIn 0.4s ease forwards;}
  .btn-press:active{transform:scale(0.96);}
  .hover-lift{transition:transform 0.2s,box-shadow 0.2s;}
  .hover-lift:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.4);}
`;

const fmtTime = ts => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const fmtDate = ts => {
  const d = new Date(ts), now = new Date();
  const diff = Math.floor((now-d)/86400000);
  if(diff===0) return "Today";
  if(diff===1) return "Yesterday";
  return d.toLocaleDateString([],{month:"short",day:"numeric"});
};
const daysSince = startTs => Math.floor((Date.now()-startTs)/86400000);
const nextMilestone = days => MILESTONES.find(m=>m>days)||null;
const prevMilestone = days => [...MILESTONES].reverse().find(m=>m<=days)||0;
const milestoneProgress = days => {
  const nxt = nextMilestone(days); const prv = prevMilestone(days);
  if(!nxt) return 100;
  return Math.round(((days-prv)/(nxt-prv))*100);
};

function Orbs() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {[
        {w:400,h:400,top:"-10%",left:"-10%",c:"rgba(74,157,122,0.06)",delay:"0s"},
        {w:300,h:300,top:"30%",right:"-5%",c:"rgba(201,168,76,0.05)",delay:"2s"},
        {w:500,h:500,bottom:"-15%",left:"20%",c:"rgba(107,140,186,0.04)",delay:"4s"},
      ].map((o,i)=>(
        <div key={i} style={{
          position:"absolute",borderRadius:"50%",
          width:o.w,height:o.h,top:o.top,left:o.left,right:o.right,bottom:o.bottom,
          background:`radial-gradient(circle,${o.c},transparent 70%)`,
          animation:`float 8s ease-in-out infinite`,animationDelay:o.delay,
        }}/>
      ))}
    </div>
  );
}

function Card({children,style={},className="",...p}){
  return <div className={className} style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:"var(--r)",padding:"20px",...style}} {...p}>{children}</div>;
}

function GoldDivider(){return <div style={{height:1,background:"linear-gradient(90deg,transparent,var(--gold-dim),transparent)",margin:"4px 0"}}/>;}

function StreakRing({days,size=140}){
  const nxt = nextMilestone(days); const prv = prevMilestone(days);
  const pct = nxt ? (days-prv)/(nxt-prv) : 1;
  const r=54, circ=2*Math.PI*r, dash=circ*pct;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{transform:"rotate(-90deg)"}}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg3)" strokeWidth="8"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#goldGrad)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{transition:"stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)"}}/>
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c9a84c"/>
            <stop offset="100%" stopColor="#f0c878"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"34px",fontWeight:600,color:"var(--cream)",lineHeight:1}}>{days}</span>
        <span style={{fontSize:"10px",color:"var(--cream3)",letterSpacing:"0.1em",textTransform:"uppercase"}}>days</span>
      </div>
    </div>
  );
}

function MoodDot({m,selected,onClick}){
  return (
    <button onClick={onClick} className="btn-press" style={{
      background:selected?"var(--card2)":"transparent",
      border:`2px solid ${selected?m.color:"var(--border2)"}`,
      borderRadius:"var(--r-sm)",padding:"10px 6px",cursor:"pointer",
      display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1,
      transition:"all 0.2s",boxShadow:selected?`0 0 16px ${m.color}44`:"none"
    }}>
      <span style={{fontSize:22}}>{m.emoji}</span>
      <span style={{fontSize:9,color:selected?m.color:"var(--cream3)",fontWeight:500,letterSpacing:"0.05em"}}>{m.label}</span>
    </button>
  );
}

function BreathingModal({onClose}){
  const [phase,setPhase]=useState(0);
  const [tick,setTick]=useState(0);
  const [cycles,setCycles]=useState(0);
  const ph = BREATHING_PHASES[phase];
  useEffect(()=>{
    const t=setInterval(()=>{
      setTick(p=>{
        if(p+1>=ph.duration){
          setPhase(prev=>{
            const next=(prev+1)%4;
            if(next===0) setCycles(c=>c+1);
            return next;
          });
          return 0;
        }
        return p+1;
      });
    },1000);
    return ()=>clearInterval(t);
  },[phase]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.3s ease"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{textAlign:"center",padding:32}}>
        <p style={{color:"var(--cream3)",fontSize:12,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:40}}>Breathing exercise · {cycles} cycle{cycles!==1?"s":""} complete</p>
        <div style={{position:"relative",width:200,height:200,margin:"0 auto 40px"}}>
          <div style={{
            position:"absolute",inset:0,borderRadius:"50%",
            background:`radial-gradient(circle,${ph.color}22,${ph.color}08)`,
            border:`2px solid ${ph.color}44`,
            animation: phase===0||phase===1?"breatheIn 0.6s ease forwards":"breatheOut 0.6s ease forwards",
          }}/>
          <div style={{
            position:"absolute",inset:"20%",borderRadius:"50%",
            background:`radial-gradient(circle,${ph.color}33,transparent)`,
            display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",
          }}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,color:ph.color,lineHeight:1}}>{ph.duration-tick}</span>
            <span style={{fontSize:11,color:`${ph.color}cc`,letterSpacing:"0.1em",marginTop:4}}>{ph.label}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:40}}>
          {BREATHING_PHASES.map((p,i)=>(
            <div key={i} style={{width:32,height:4,borderRadius:2,background:i===phase?p.color:"var(--bg3)",transition:"background 0.3s"}}/>
          ))}
        </div>
        <button onClick={onClose} className="btn-press" style={{background:"var(--card)",border:"1px solid var(--border2)",color:"var(--cream3)",borderRadius:"50px",padding:"12px 32px",cursor:"pointer",fontSize:14}}>Close</button>
      </div>
    </div>
  );
}

function ConfettiBlast(){
  const pieces = Array.from({length:24},(_,i)=>({
    id:i, left:`${Math.random()*100}%`, color:["#c9a84c","#4a9d7a","#f0e8d8","#c9584a","#6b8cba"][i%5],
    delay:`${Math.random()*0.8}s`, dur:`${1.5+Math.random()}s`, size:6+Math.random()*8,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:300,overflow:"hidden"}}>
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute",top:0,left:p.left,
          width:p.size,height:p.size*0.6,background:p.color,borderRadius:2,
          animation:`confetti ${p.dur} ease-in forwards`,animationDelay:p.delay,
        }}/>
      ))}
    </div>
  );
}

function MilestoneToast({days,onClose}){
  const [show,setShow]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>{setShow(false);setTimeout(onClose,400);},4000);return()=>clearTimeout(t);});
  return (
    <>
      <ConfettiBlast/>
      <div style={{
        position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",zIndex:250,
        background:"linear-gradient(135deg,var(--card),var(--card2))",
        border:"1px solid var(--gold)",borderRadius:"var(--r)",
        padding:"20px 28px",textAlign:"center",
        boxShadow:"0 0 40px rgba(201,168,76,0.3)",
        animation:`scaleIn 0.4s ease, glowPulse 2s ease infinite`,
        maxWidth:320,width:"90vw",
        opacity:show?1:0,transition:"opacity 0.4s",
      }}>
        <div style={{fontSize:48,marginBottom:8}}>{MILESTONE_ICONS[days]||"🏆"}</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"var(--gold)",marginBottom:4}}>Milestone Reached</div>
        <div style={{color:"var(--cream)",fontSize:16,marginBottom:8}}>{MILESTONE_NAMES[days]}</div>
        <GoldDivider/>
        <div style={{color:"var(--cream3)",fontSize:13,marginTop:8}}>This moment matters. You made it here.</div>
      </div>
    </>
  );
}

function RoleSelect({onSelect}){
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,position:"relative",zIndex:1}}>
      <div style={{animation:"fadeUp 0.6s ease",textAlign:"center",marginBottom:52}}>
        <div style={{fontSize:52,marginBottom:16,animation:"float 4s ease-in-out infinite"}}>🌿</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:300,color:"var(--cream)",letterSpacing:"-0.02em",lineHeight:1.1}}>ClearPath</h1>
        <p style={{color:"var(--cream3)",fontSize:14,marginTop:10,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:300}}>A sanctuary for your journey</p>
      </div>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:14,animation:"fadeUp 0.7s ease 0.1s both"}}>
        <button onClick={()=>onSelect("tracker")} className="btn-press hover-lift" style={{
          background:"linear-gradient(135deg,var(--bg3),var(--card2))",
          border:"1px solid var(--border)",borderRadius:"var(--r)",
          padding:"28px 24px",cursor:"pointer",textAlign:"left",
          boxShadow:"0 4px 24px rgba(0,0,0,0.3)"
        }}>
          <div style={{fontSize:32,marginBottom:10}}>🌱</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"var(--cream)",marginBottom:5}}>I'm on a journey</div>
          <div style={{fontSize:13,color:"var(--cream3)",fontWeight:300,lineHeight:1.6}}>Track your days, log cravings, journal your thoughts, and hear from those who love you.</div>
        </button>
        <button onClick={()=>onSelect("supporter")} className="btn-press hover-lift" style={{
          background:"linear-gradient(135deg,var(--card),var(--card2))",
          border:"1px solid var(--gold-dim)",borderRadius:"var(--r)",
          padding:"28px 24px",cursor:"pointer",textAlign:"left",
          boxShadow:"0 4px 24px rgba(201,168,76,0.1)"
        }}>
          <div style={{fontSize:32,marginBottom:10}}>💛</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"var(--gold)",marginBottom:5}}>I'm a supporter</div>
          <div style={{fontSize:13,color:"var(--cream3)",fontWeight:300,lineHeight:1.6}}>Send a voice memo, a written message, or a quick nudge of love.</div>
        </button>
      </div>
      <p style={{color:"var(--cream3)",fontSize:11,marginTop:32,opacity:0.5,letterSpacing:"0.1em"}}>Your data stays private, always.</p>
    </div>
  );
}

const VALID_CODE = "CLRP-7423";

function SupporterPortal({onBack,onSend,stats}){
  const [step,setStep]=useState("code");
  const [codeInput,setCodeInput]=useState("");
  const [codeError,setCodeError]=useState(false);
  const [connectedName,setConnectedName]=useState("");
  const [form,setForm]=useState({name:"",text:"",nudge:null});
  const [recording,setRecording]=useState(false);
  const [recTime,setRecTime]=useState(0);
  const [audioUrl,setAudioUrl]=useState(null);
  const [mr,setMr]=useState(null);
  const timerRef=useRef();

  function submitCode(){
    const cleaned = codeInput.trim().toUpperCase();
    if(cleaned===VALID_CODE){
      setConnectedName("someone on their journey");
      setCodeError(false);
      setStep("menu");
    } else {
      setCodeError(true);
      setTimeout(()=>setCodeError(false),2000);
    }
  }

  if(step==="code") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,position:"relative",zIndex:1}}>
      <button onClick={onBack} style={{position:"absolute",top:52,left:24,background:"none",border:"none",color:"var(--cream3)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6}}>← Back</button>
      <div style={{textAlign:"center",marginBottom:40,animation:"fadeUp 0.5s ease"}}>
        <div style={{fontSize:44,marginBottom:14}}>🔑</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:400,color:"var(--cream)",marginBottom:8}}>Enter supporter code</h2>
        <p style={{color:"var(--cream3)",fontSize:14,maxWidth:260,lineHeight:1.7,fontWeight:300}}>Ask the person you're supporting to share their unique code from the Messages tab.</p>
      </div>
      <div style={{width:"100%",maxWidth:320,animation:"fadeUp 0.5s ease 0.1s both"}}>
        <input
          value={codeInput}
          onChange={e=>setCodeInput(e.target.value.toUpperCase())}
          onKeyDown={e=>e.key==="Enter"&&submitCode()}
          placeholder="e.g. CLRP-7423"
          maxLength={9}
          style={{
            width:"100%",background:"var(--card)",
            border:`1px solid ${codeError?"var(--red)":codeInput.length>0?"var(--gold-dim)":"var(--border2)"}`,
            borderRadius:"var(--r-sm)",padding:"18px 20px",
            color:"var(--cream)",fontSize:22,outline:"none",
            textAlign:"center",letterSpacing:"0.3em",fontFamily:"monospace",fontWeight:700,
            marginBottom:12,display:"block",
            transition:"border-color 0.2s, box-shadow 0.2s",
            boxShadow:codeError?"0 0 16px rgba(201,80,74,0.3)":codeInput.length>0?"0 0 16px rgba(201,168,76,0.15)":"none",
            boxSizing:"border-box",
          }}
        />
        {codeError&&(
          <p style={{color:"var(--red)",fontSize:13,textAlign:"center",marginBottom:12,animation:"fadeIn 0.2s ease"}}>
            That code doesn't match any account. Double-check with your person.
          </p>
        )}
        <button onClick={submitCode} disabled={codeInput.length<9} className="btn-press" style={{
          width:"100%",
          background:codeInput.length>=9?"linear-gradient(135deg,#b8942a,#d4b050)":"var(--bg3)",
          color:codeInput.length>=9?"#0a1a14":"var(--cream3)",
          border:"none",borderRadius:"50px",padding:"18px",
          fontSize:15,cursor:codeInput.length>=9?"pointer":"not-allowed",
          fontFamily:"'Cormorant Garamond',serif",letterSpacing:"0.04em",fontWeight:600,
          transition:"all 0.2s",
        }}>Connect →</button>
        <p style={{color:"var(--cream3)",fontSize:11,textAlign:"center",marginTop:16,opacity:0.5,lineHeight:1.6}}>Codes are shared privately between you and the person you're supporting.</p>
      </div>
    </div>
  );

  const NUDGES=[{e:"💛",l:"Thinking of you"},{e:"🌿",l:"Stay grounded"},{e:"🔥",l:"You're on fire"},{e:"🤗",l:"Sending a hug"},{e:"🌅",l:"New day, new start"},{e:"✨",l:"Proud of you"}];

  async function startRec(){
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const rec=new MediaRecorder(stream);
      const chunks=[];
      rec.ondataavailable=e=>chunks.push(e.data);
      rec.onstop=()=>{setAudioUrl(URL.createObjectURL(new Blob(chunks,{type:"audio/webm"})));stream.getTracks().forEach(t=>t.stop());};
      rec.start(); setMr(rec); setRecording(true); setRecTime(0);
      timerRef.current=setInterval(()=>setRecTime(t=>t+1),1000);
    }catch{alert("Microphone permission needed.");}
  }
  function stopRec(){if(mr){mr.stop();setMr(null);}setRecording(false);clearInterval(timerRef.current);}
  function send(){
    if(!form.name) return;
    const dur=recTime>0?`${Math.floor(recTime/60)}:${String(recTime%60).padStart(2,"0")}`:null;
    onSend({id:Date.now(),from:form.name,initials:form.name[0].toUpperCase(),color:"#c9a84c",text:form.text||form.nudge||"",hasAudio:!!audioUrl,duration:dur,audioUrl,ts:Date.now(),isNudge:!form.text&&!!form.nudge});
    setStep("sent");
  }

  if(step==="sent") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center",position:"relative",zIndex:1}}>
      <ConfettiBlast/>
      <div style={{fontSize:64,marginBottom:24,animation:"float 3s ease-in-out infinite"}}>💛</div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:400,color:"var(--cream)",marginBottom:12}}>Sent with love</h2>
      <p style={{color:"var(--cream3)",maxWidth:260,lineHeight:1.8,fontSize:14}}>They'll receive your message the next time they open ClearPath. Thank you for showing up.</p>
      <button onClick={()=>{setStep("menu");setForm({name:"",text:"",nudge:null});setAudioUrl(null);setRecTime(0);}} className="btn-press" style={{marginTop:32,background:"var(--card)",border:"1px solid var(--border)",color:"var(--cream3)",borderRadius:"50px",padding:"12px 28px",cursor:"pointer",fontSize:14}}>Send another</button>
      <button onClick={onBack} style={{marginTop:12,background:"none",border:"none",color:"var(--cream3)",cursor:"pointer",fontSize:13,opacity:0.6}}>← Back to start</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
      {}
      <div style={{padding:"52px 24px 24px",borderBottom:"1px solid var(--border2)"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"var(--cream3)",cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Back</button>
        <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
          <div style={{fontSize:36}}>💛</div>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400,color:"var(--cream)"}}>Supporter Portal</h1>
            <p style={{color:"var(--cream3)",fontSize:13,marginTop:4,fontWeight:300}}>Leave something meaningful for someone who needs it</p>
          </div>
        </div>
        {}
        <div style={{marginTop:20,background:"var(--bg3)",borderRadius:"var(--r-sm)",padding:"14px 18px",display:"flex",gap:24}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:"var(--gold)"}}>{stats.days}</div>
            <div style={{fontSize:10,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Days sober</div>
          </div>
          <div style={{width:1,background:"var(--border2)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:"var(--green)"}}>{stats.cravingsOvercome}</div>
            <div style={{fontSize:10,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Cravings overcome</div>
          </div>
          <div style={{width:1,background:"var(--border2)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:"var(--lavender)"}}>{stats.supporters}</div>
            <div style={{fontSize:10,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Supporters</div>
          </div>
        </div>
      </div>

      <div style={{flex:1,padding:"24px",overflowY:"auto"}}>
        {}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,color:"var(--gold)",textTransform:"uppercase",letterSpacing:"0.15em",display:"block",marginBottom:8}}>Your name</label>
          <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
            placeholder="How they know you..."
            style={{width:"100%",background:"var(--card)",border:"1px solid var(--border2)",borderRadius:"var(--r-sm)",padding:"14px 16px",color:"var(--cream)",fontSize:15,outline:"none",transition:"border-color 0.2s"}}
            onFocus={e=>e.target.style.borderColor="var(--gold-dim)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
        </div>

        {}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,color:"var(--gold)",textTransform:"uppercase",letterSpacing:"0.15em",display:"block",marginBottom:12}}>Quick nudge</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {NUDGES.map(n=>(
              <button key={n.l} onClick={()=>setForm(p=>({...p,nudge:p.nudge===n.l?null:n.l,text:""}))} className="btn-press" style={{
                background:form.nudge===n.l?"var(--gold-dim)":"var(--card)",
                border:`1px solid ${form.nudge===n.l?"var(--gold)":"var(--border2)"}`,
                borderRadius:"var(--r-sm)",padding:"12px 8px",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              }}>
                <span style={{fontSize:20}}>{n.e}</span>
                <span style={{fontSize:10,color:"var(--cream3)"}}>{n.l}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{flex:1,height:1,background:"var(--border2)"}}/>
          <span style={{color:"var(--cream3)",fontSize:12}}>or write something</span>
          <div style={{flex:1,height:1,background:"var(--border2)"}}/>
        </div>

        {}
        <div style={{marginBottom:20}}>
          <textarea value={form.text} onChange={e=>setForm(p=>({...p,text:e.target.value,nudge:e.target.value?null:p.nudge}))}
            placeholder="Write from the heart. There are no wrong words here…"
            rows={4}
            style={{width:"100%",background:"var(--card)",border:"1px solid var(--border2)",borderRadius:"var(--r-sm)",padding:"14px 16px",color:"var(--cream)",fontSize:14,outline:"none",resize:"none",lineHeight:1.7,transition:"border-color 0.2s"}}
            onFocus={e=>e.target.style.borderColor="var(--gold-dim)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
        </div>

        {}
        <div style={{marginBottom:32}}>
          <label style={{fontSize:11,color:"var(--gold)",textTransform:"uppercase",letterSpacing:"0.15em",display:"block",marginBottom:12}}>Voice memo <span style={{color:"var(--cream3)",textTransform:"none",letterSpacing:0,fontSize:11}}>(optional — most powerful)</span></label>
          {!audioUrl ? (
            <button onClick={recording?stopRec:startRec} className="btn-press" style={{
              width:"100%",background:recording?"rgba(201,80,74,0.1)":"var(--card)",
              border:`1px solid ${recording?"var(--red)":"var(--border2)"}`,
              borderRadius:"var(--r-sm)",padding:"18px 20px",cursor:"pointer",
              display:"flex",alignItems:"center",gap:16,
              animation:recording?"recordPulse 1.5s ease infinite":"none",
            }}>
              <div style={{width:44,height:44,borderRadius:"50%",background:recording?"var(--red)":"var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                {recording?"⏹":"🎙"}
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{color:recording?"var(--red)":"var(--cream)",fontSize:14,fontWeight:500}}>
                  {recording?`Recording… ${Math.floor(recTime/60)}:${String(recTime%60).padStart(2,"0")}`:"Tap to record your voice"}
                </div>
                <div style={{color:"var(--cream3)",fontSize:12,marginTop:2}}>{recording?"Tap to stop recording":"Your voice is irreplaceable"}</div>
              </div>
            </button>
          ):(
            <div style={{background:"var(--card)",border:"1px solid var(--green-dim)",borderRadius:"var(--r-sm)",padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{color:"var(--green2)",fontSize:13}}>✓ Voice memo recorded · {Math.floor(recTime/60)}:{String(recTime%60).padStart(2,"0")}</span>
                <button onClick={()=>{setAudioUrl(null);setRecTime(0);}} style={{background:"none",border:"none",color:"var(--cream3)",cursor:"pointer",fontSize:12}}>Remove</button>
              </div>
              <audio src={audioUrl} controls style={{width:"100%",filter:"invert(1) hue-rotate(180deg) brightness(0.8)"}}/>
            </div>
          )}
        </div>

        <button onClick={send} disabled={!form.name||((!form.text&&!form.nudge&&!audioUrl))} className="btn-press" style={{
          width:"100%",
          background:(!form.name||(!form.text&&!form.nudge&&!audioUrl))?"var(--bg3)":"linear-gradient(135deg,#b8942a,#d4b050)",
          color:(!form.name||(!form.text&&!form.nudge&&!audioUrl))?"var(--cream3)":"#0a1a14",
          border:"none",borderRadius:"50px",padding:"18px",
          fontSize:15,cursor:(!form.name||(!form.text&&!form.nudge&&!audioUrl))?"not-allowed":"pointer",
          fontFamily:"'Cormorant Garamond',serif",letterSpacing:"0.04em",fontWeight:600,
          transition:"all 0.2s",
        }}>Send with love 💛</button>
      </div>
    </div>
  );
}

function TrackerApp({onBack,messages,onPublishProfile,onClearMessages}){
  const [startTs] = useState(()=>Date.now()-23*86400000);
  const [days, setDays] = useState(()=>daysSince(Date.now()-23*86400000));
  const [tab,setTab]=useState("today");
  const [todayMood,setTodayMood]=useState(null);
  const [cravings,setCravings]=useState(INITIAL_CRAVINGS);
  const [journal,setJournal]=useState(INITIAL_JOURNAL);
  const [gratitude,setGratitude]=useState(["","",""]);
  const [intention,setIntention]=useState("");
  const [intentionSaved,setIntentionSaved]=useState(false);
  const [showBreathing,setShowBreathing]=useState(false);
  const [showCravingForm,setShowCravingForm]=useState(false);
  const [showJournalForm,setShowJournalForm]=useState(false);
  const [showMilestone,setShowMilestone]=useState(null);
  const [newCraving,setNewCraving]=useState({trigger:"",intensity:5,note:""});
  const [newJournal,setNewJournal]=useState("");
  const [playingId,setPlayingId]=useState(null);
  const [prevDays,setPrevDays]=useState(days);

  useEffect(()=>{
    onPublishProfile({days, cravingsOvercome:cravings.filter(c=>c.overcome).length, supporters:3});
  },[days, cravings]);

  useEffect(()=>{
    if(MILESTONES.includes(days)&&days!==prevDays){setShowMilestone(days);}
    setPrevDays(days);
  },[days]);

  const nxt=nextMilestone(days);
  const prog=milestoneProgress(days);
  const allMessages=[...INITIAL_MESSAGES,...messages].sort((a,b)=>b.ts-a.ts);
  const newMsgCount = messages.filter(m=>m.ts>Date.now()-300000).length;

  function submitCraving(){
    if(!newCraving.trigger) return;
    setCravings(p=>[{id:Date.now(),trigger:newCraving.trigger,intensity:newCraving.intensity,note:newCraving.note,ts:Date.now(),overcome:false},...p]);
    setNewCraving({trigger:"",intensity:5,note:""});
    setShowCravingForm(false);
  }
  function markOvercome(id){setCravings(p=>p.map(c=>c.id===id?{...c,overcome:true}:c));}
  function submitJournal(){
    if(!newJournal.trim()) return;
    setJournal(p=>[{id:Date.now(),text:newJournal,ts:Date.now(),mood:todayMood},...p]);
    setNewJournal(""); setShowJournalForm(false);
  }

  const today = new Date().toDateString();
  const affirmation = AFFIRMATIONS[new Date().getDate()%AFFIRMATIONS.length];
  const todayCravings = cravings.filter(c=>new Date(c.ts).toDateString()===today);

  const TABS=[
    {id:"today",icon:"🌿",label:"Today"},
    {id:"cravings",icon:"🌊",label:"Cravings"},
    {id:"journal",icon:"📖",label:"Journal"},
    {id:"messages",icon:"💛",label:"Messages"},
  ];

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
      {showBreathing&&<BreathingModal onClose={()=>setShowBreathing(false)}/>}
      {showMilestone&&<MilestoneToast days={showMilestone} onClose={()=>setShowMilestone(null)}/>}

      {}
      <div style={{background:"linear-gradient(180deg,var(--bg2),var(--bg))",padding:"48px 24px 0",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,168,76,0.06),transparent)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div>
            <p style={{color:"var(--cream3)",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:4}}>
              {new Date().toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"})}
            </p>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,color:"var(--cream)",lineHeight:1.2}}>
              {days===0?"Day one begins":days<7?"Keep going":"You're on track"}
            </h1>
          </div>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.05)",border:"1px solid var(--border2)",color:"var(--cream3)",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:13,flexShrink:0}}>✕</button>
        </div>

        {}
        <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:24}}>
          <StreakRing days={days}/>
          <div style={{flex:1}}>
            {nxt&&<>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{color:"var(--cream3)",fontSize:12}}>{MILESTONE_ICONS[nxt]} {MILESTONE_NAMES[nxt]}</span>
                <span style={{color:"var(--gold)",fontSize:12}}>{nxt-days}d left</span>
              </div>
              <div style={{background:"var(--bg3)",borderRadius:"50px",height:6}}>
                <div style={{background:"linear-gradient(90deg,var(--gold),var(--gold2))",borderRadius:"50px",height:"100%",width:`${prog}%`,transition:"width 1s ease",boxShadow:"0 0 8px rgba(201,168,76,0.4)"}}/>
              </div>
            </>}
            {!nxt&&<div style={{color:"var(--gold)",fontFamily:"'Cormorant Garamond',serif",fontSize:18}}>🌳 One full year. Extraordinary.</div>}
            <div style={{display:"flex",gap:12,marginTop:12}}>
              <button onClick={()=>setShowBreathing(true)} className="btn-press" style={{background:"var(--green-dim)",border:"none",borderRadius:"50px",padding:"8px 16px",color:"var(--green2)",cursor:"pointer",fontSize:12,fontWeight:500}}>🫁 Breathe</button>
              <button onClick={()=>setShowCravingForm(true)} className="btn-press" style={{background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"50px",padding:"8px 16px",color:"var(--cream3)",cursor:"pointer",fontSize:12}}>+ Log craving</button>
            </div>
          </div>
        </div>

        {}
        <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--border2)"}}>
          {TABS.map(t=>{
            const active=tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                flex:1,background:"none",border:"none",borderBottom:`2px solid ${active?"var(--gold)":"transparent"}`,
                padding:"12px 4px",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                transition:"all 0.2s",position:"relative",
              }}>
                <span style={{fontSize:16,opacity:active?1:0.45}}>{t.icon}</span>
                <span style={{fontSize:10,color:active?"var(--gold)":"var(--cream3)",fontWeight:active?600:400,letterSpacing:"0.05em"}}>{t.label}</span>
                {t.id==="messages"&&newMsgCount>0&&<span style={{position:"absolute",top:8,right:"50%",transform:"translateX(12px)",width:8,height:8,borderRadius:"50%",background:"var(--gold)"}}/>}
              </button>
            );
          })}
        </div>
      </div>

      {}
      <div style={{flex:1,overflowY:"auto",padding:"24px"}}>

        {}
        {tab==="today"&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            {}
            <Card style={{marginBottom:14}}>
              <p style={{color:"var(--gold)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:14}}>How are you feeling?</p>
              <div style={{display:"flex",gap:6}}>
                {MOODS.map((m,i)=><MoodDot key={i} m={m} selected={todayMood===i} onClick={()=>setTodayMood(i)}/>)}
              </div>
              {todayMood!==null&&<p style={{color:"var(--cream3)",fontSize:13,marginTop:12,fontStyle:"italic"}}>Feeling {MOODS[todayMood].label.toLowerCase()} today — that's noted and that's valid.</p>}
            </Card>

            {}
            <Card style={{marginBottom:14,background:"linear-gradient(135deg,var(--bg3),var(--card))",border:"1px solid var(--border)"}}>
              <p style={{color:"var(--gold)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:12}}>Today's reflection</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:"var(--cream)",lineHeight:1.7,margin:0}}>"{affirmation}"</p>
            </Card>

            {}
            <Card style={{marginBottom:14}}>
              <p style={{color:"var(--gold)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:12}}>Set your intention</p>
              {!intentionSaved?(
                <div style={{display:"flex",gap:10}}>
                  <input value={intention} onChange={e=>setIntention(e.target.value)}
                    placeholder="Today I choose to…"
                    style={{flex:1,background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r-xs)",padding:"12px 14px",color:"var(--cream)",fontSize:14,outline:"none"}}/>
                  <button onClick={()=>intention&&setIntentionSaved(true)} className="btn-press" style={{background:"var(--green-dim)",border:"none",borderRadius:"var(--r-xs)",padding:"12px 16px",color:"var(--green2)",cursor:"pointer",fontSize:13}}>Set</button>
                </div>
              ):(
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",color:"var(--cream)",margin:0}}>"{intention}"</p>
                  <button onClick={()=>setIntentionSaved(false)} style={{background:"none",border:"none",color:"var(--cream3)",cursor:"pointer",fontSize:12}}>Edit</button>
                </div>
              )}
            </Card>

            {}
            <Card style={{marginBottom:14}}>
              <p style={{color:"var(--gold)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:12}}>Three things I'm grateful for</p>
              {gratitude.map((g,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?8:0}}>
                  <span style={{color:"var(--gold)",fontSize:12,fontWeight:600,width:16}}>{i+1}.</span>
                  <input value={g} onChange={e=>{const n=[...gratitude];n[i]=e.target.value;setGratitude(n);}}
                    placeholder={["Something small today…","A person in my corner…","Something my body did…"][i]}
                    style={{flex:1,background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r-xs)",padding:"10px 12px",color:"var(--cream)",fontSize:13,outline:"none"}}/>
                </div>
              ))}
            </Card>

            {}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[
                {label:"Cravings today",val:todayCravings.length,icon:"🌊",color:"var(--blue)"},
                {label:"Total days",val:days,icon:"🔥",color:"var(--gold)"},
                {label:"Overcome",val:cravings.filter(c=>c.overcome).length,icon:"💚",color:"var(--green)"},
              ].map((s,i)=>(
                <Card key={i} style={{textAlign:"center",padding:"16px 10px"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:s.color}}>{s.val}</div>
                  <div style={{color:"var(--cream3)",fontSize:10,lineHeight:1.3}}>{s.label}</div>
                </Card>
              ))}
            </div>

            {}
            <button onClick={()=>setShowBreathing(true)} className="btn-press hover-lift" style={{
              width:"100%",background:"linear-gradient(135deg,rgba(201,80,74,0.1),rgba(201,80,74,0.05))",
              border:"1px solid rgba(201,80,74,0.3)",borderRadius:"var(--r)",padding:"18px 20px",
              cursor:"pointer",display:"flex",alignItems:"center",gap:16,textAlign:"left"
            }}>
              <div style={{fontSize:32}}>🆘</div>
              <div>
                <div style={{color:"#e88a84",fontSize:14,fontWeight:600}}>I need help right now</div>
                <div style={{color:"var(--cream3)",fontSize:12}}>Tap for guided breathing & grounding</div>
              </div>
            </button>
          </div>
        )}

        {}
        {tab==="cravings"&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:"var(--cream)"}}>Craving Journal</h2>
                <p style={{color:"var(--cream3)",fontSize:13,marginTop:2}}>{cravings.filter(c=>c.overcome).length} of {cravings.length} overcome</p>
              </div>
              <button onClick={()=>setShowCravingForm(true)} className="btn-press" style={{background:"var(--gold-dim)",border:"none",borderRadius:"50px",padding:"10px 20px",color:"var(--gold2)",cursor:"pointer",fontSize:13}}>+ Log</button>
            </div>

            {showCravingForm&&(
              <Card style={{marginBottom:16,border:"1px solid var(--border)",animation:"scaleIn 0.3s ease"}}>
                <p style={{color:"var(--gold)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:16}}>New craving entry</p>
                <div style={{marginBottom:14}}>
                  <p style={{color:"var(--cream3)",fontSize:12,marginBottom:8}}>What triggered it?</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {TRIGGERS.map(t=>(
                      <button key={t} onClick={()=>setNewCraving(p=>({...p,trigger:t}))} className="btn-press" style={{
                        background:newCraving.trigger===t?"var(--gold-dim)":"var(--bg3)",
                        border:`1px solid ${newCraving.trigger===t?"var(--gold)":"var(--border2)"}`,
                        borderRadius:"50px",padding:"6px 14px",cursor:"pointer",
                        color:newCraving.trigger===t?"var(--gold)":"var(--cream3)",fontSize:13,
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:14}}>
                  <p style={{color:"var(--cream3)",fontSize:12,marginBottom:8}}>Intensity: <span style={{color:"var(--cream)",fontWeight:600}}>{newCraving.intensity}/10</span></p>
                  <input type="range" min="1" max="10" value={newCraving.intensity} onChange={e=>setNewCraving(p=>({...p,intensity:+e.target.value}))} style={{width:"100%"}}/>
                </div>
                <textarea value={newCraving.note} onChange={e=>setNewCraving(p=>({...p,note:e.target.value}))}
                  placeholder="How are you coping right now? What will you do instead?"
                  rows={2}
                  style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r-xs)",padding:"12px",color:"var(--cream)",fontSize:13,resize:"none",outline:"none",marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}/>
                {}
                <div style={{background:"rgba(74,157,122,0.08)",border:"1px solid rgba(74,157,122,0.2)",borderRadius:"var(--r-xs)",padding:"12px",marginBottom:14}}>
                  <p style={{color:"var(--green2)",fontSize:13,margin:0}}>💚 Right now: breathe in for 4, hold for 4, out for 6. The wave will pass in under 20 minutes.</p>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setShowCravingForm(false)} style={{flex:1,background:"none",border:"1px solid var(--border2)",borderRadius:"50px",padding:"12px",color:"var(--cream3)",cursor:"pointer",fontSize:13}}>Cancel</button>
                  <button onClick={submitCraving} disabled={!newCraving.trigger} className="btn-press" style={{flex:2,background:newCraving.trigger?"var(--green-dim)":"var(--bg3)",border:"none",borderRadius:"50px",padding:"12px",color:newCraving.trigger?"var(--green2)":"var(--cream3)",cursor:newCraving.trigger?"pointer":"not-allowed",fontSize:13,fontWeight:600}}>Save entry</button>
                </div>
              </Card>
            )}

            {cravings.map(c=>(
              <Card key={c.id} style={{marginBottom:12,opacity:c.overcome?0.7:1,transition:"opacity 0.3s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:c.intensity>7?"var(--red)":c.intensity>4?"#e8a84c":"var(--green)",flexShrink:0}}/>
                    <span style={{color:"var(--cream)",fontSize:14,fontWeight:500}}>{c.trigger}</span>
                    {c.overcome&&<span style={{background:"rgba(74,157,122,0.15)",color:"var(--green2)",fontSize:10,padding:"2px 8px",borderRadius:"50px",border:"1px solid rgba(74,157,122,0.3)"}}>Overcome</span>}
                  </div>
                  <span style={{color:"var(--cream3)",fontSize:11}}>{fmtDate(c.ts)}, {fmtTime(c.ts)}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:c.note?10:0}}>
                  <div style={{flex:1,background:"var(--bg3)",borderRadius:"50px",height:5}}>
                    <div style={{width:`${c.intensity*10}%`,background:c.intensity>7?"var(--red)":c.intensity>4?"#e8a84c":"var(--green)",borderRadius:"50px",height:"100%",transition:"width 0.6s"}}/>
                  </div>
                  <span style={{color:"var(--cream3)",fontSize:11,fontWeight:600,width:32,textAlign:"right"}}>{c.intensity}/10</span>
                </div>
                {c.note&&<p style={{color:"var(--cream3)",fontSize:13,fontStyle:"italic",marginBottom:10}}>"{c.note}"</p>}
                {!c.overcome&&(
                  <button onClick={()=>markOvercome(c.id)} className="btn-press" style={{background:"none",border:"1px solid var(--green-dim)",borderRadius:"50px",padding:"6px 16px",color:"var(--green2)",cursor:"pointer",fontSize:12,marginTop:4}}>✓ Mark as overcome</button>
                )}
              </Card>
            ))}
            {cravings.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:"var(--cream3)"}}>
              <div style={{fontSize:48,marginBottom:12,opacity:0.4}}>🌊</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:18}}>No cravings logged yet</p>
            </div>}
          </div>
        )}

        {}
        {tab==="journal"&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:"var(--cream)"}}>Your Journal</h2>
              <button onClick={()=>setShowJournalForm(true)} className="btn-press" style={{background:"var(--gold-dim)",border:"none",borderRadius:"50px",padding:"10px 20px",color:"var(--gold2)",cursor:"pointer",fontSize:13}}>+ Write</button>
            </div>
            {showJournalForm&&(
              <Card style={{marginBottom:16,border:"1px solid var(--border)",animation:"scaleIn 0.3s ease"}}>
                <p style={{color:"var(--gold)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:12}}>New entry</p>
                <textarea value={newJournal} onChange={e=>setNewJournal(e.target.value)}
                  placeholder="Write anything. This is yours alone…"
                  rows={5}
                  style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r-xs)",padding:"14px",color:"var(--cream)",fontSize:15,resize:"none",outline:"none",lineHeight:1.8,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",marginBottom:14}}/>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setShowJournalForm(false)} style={{flex:1,background:"none",border:"1px solid var(--border2)",borderRadius:"50px",padding:"12px",color:"var(--cream3)",cursor:"pointer",fontSize:13}}>Cancel</button>
                  <button onClick={submitJournal} disabled={!newJournal.trim()} className="btn-press" style={{flex:2,background:newJournal.trim()?"var(--gold-dim)":"var(--bg3)",border:"none",borderRadius:"50px",padding:"12px",color:newJournal.trim()?"var(--gold2)":"var(--cream3)",cursor:newJournal.trim()?"pointer":"not-allowed",fontSize:13,fontWeight:600}}>Save entry</button>
                </div>
              </Card>
            )}
            {journal.map(j=>(
              <Card key={j.id} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{color:"var(--cream3)",fontSize:12}}>{fmtDate(j.ts)}</span>
                  {j.mood!==null&&j.mood!==undefined&&<span style={{fontSize:16}}>{MOODS[j.mood]?.emoji}</span>}
                </div>
                <GoldDivider/>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:"var(--cream)",lineHeight:1.8,marginTop:12}}>{j.text}</p>
              </Card>
            ))}
          </div>
        )}

        {}
        {tab==="messages"&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:"var(--cream)"}}>From your people</h2>
              {messages.length>0&&<button onClick={onClearMessages} className="btn-press" style={{background:"none",border:"1px solid var(--border2)",borderRadius:"50px",padding:"6px 14px",color:"var(--cream3)",cursor:"pointer",fontSize:11}}>Clear received</button>}
            </div>
            <p style={{color:"var(--cream3)",fontSize:13,marginBottom:20}}>{allMessages.length} messages · {newMsgCount>0?<span style={{color:"var(--gold)"}}>{newMsgCount} just arrived</span>:"all caught up"}</p>
            {allMessages.map(m=>(
              <Card key={m.id} style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:m.color||"var(--gold-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"var(--bg)",fontWeight:600,flexShrink:0}}>{m.initials||m.from[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{color:"var(--cream)",fontWeight:600,fontSize:15}}>{m.from}</div>
                    <div style={{color:"var(--cream3)",fontSize:11,marginTop:2}}>{fmtDate(m.ts)} · {fmtTime(m.ts)}{m.hasAudio?` · 🎙 ${m.duration}`:""}</div>
                  </div>
                  {m.ts>Date.now()-86400000&&<span style={{background:"rgba(201,168,76,0.15)",color:"var(--gold)",fontSize:10,padding:"3px 8px",borderRadius:"50px",border:"1px solid var(--border)"}}>New</span>}
                </div>
                {m.isNudge?(
                  <div style={{textAlign:"center",padding:"12px 0",fontSize:32}}>{m.text}</div>
                ):(
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:"var(--cream)",lineHeight:1.8,marginBottom:m.hasAudio?14:0}}>"{m.text}"</p>
                )}
                {m.hasAudio&&m.audioUrl&&(
                  <audio src={m.audioUrl} controls style={{width:"100%",marginTop:4,filter:"invert(1) hue-rotate(180deg) brightness(0.7)"}}/>
                )}
                {m.hasAudio&&!m.audioUrl&&(
                  <button onClick={()=>setPlayingId(p=>p===m.id?null:m.id)} className="btn-press" style={{
                    display:"flex",alignItems:"center",gap:10,width:"100%",
                    background:playingId===m.id?"var(--gold-dim)":"var(--bg3)",
                    border:`1px solid ${playingId===m.id?"var(--gold)":"var(--border2)"}`,
                    borderRadius:"50px",padding:"10px 18px",cursor:"pointer",
                  }}>
                    <span style={{fontSize:16}}>{playingId===m.id?"⏸":"▶"}</span>
                    <span style={{color:playingId===m.id?"var(--gold)":"var(--cream3)",fontSize:13}}>{playingId===m.id?`Playing · ${m.duration}`:`Play voice memo · ${m.duration}`}</span>
                  </button>
                )}
              </Card>
            ))}
            <Card style={{textAlign:"center",border:"1px solid var(--border)",background:"var(--bg3)"}}>
              <p style={{color:"var(--cream3)",fontSize:13,marginBottom:12}}>Share your supporter code</p>
              <div style={{fontFamily:"monospace",fontSize:22,color:"var(--gold)",letterSpacing:"0.3em",fontWeight:700,padding:"12px",background:"var(--bg)",borderRadius:"var(--r-xs)",display:"inline-block"}}>CLRP-7423</div>
              <p style={{color:"var(--cream3)",fontSize:11,marginTop:10,opacity:0.6}}>Supporters enter this code to send you messages</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

const STORAGE_KEY_MSGS    = "clearpath:messages:CLRP-7423";
const STORAGE_KEY_PROFILE = "clearpath:profile:CLRP-7423";
const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("clearpath") : null;

function readSharedMessages(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY_MSGS)||"[]"); }
  catch{ return []; }
}

function writeSharedMessages(msgs){
  try{
    localStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(msgs));
    bc && bc.postMessage({type:"messages", data:msgs});
  }catch{}
}

function readProfile(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE)||"null"); }
  catch{ return null; }
}

function writeProfile(p){
  try{
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(p));
    bc && bc.postMessage({type:"profile", data:p});
  }catch{}
}

function SyncBadge({synced}){
  return (
    <div style={{position:"fixed",bottom:80,right:16,zIndex:400,display:"flex",alignItems:"center",gap:6,
      background:"var(--card)",border:"1px solid var(--border2)",borderRadius:"50px",padding:"6px 12px",
      opacity: synced?1:0.4, transition:"opacity 0.4s", pointerEvents:"none"}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:synced?"var(--green)":"var(--cream3)",
        boxShadow:synced?"0 0 6px var(--green)":"none", animation:synced?"glowPulse 2s infinite":"none"}}/>
      <span style={{fontSize:10,color:"var(--cream3)",letterSpacing:"0.08em"}}>{synced?"LIVE SYNC":"CONNECTING"}</span>
    </div>
  );
}

export default function App(){
  const [role,setRole]=useState(null);
  const [messages,setMessages]=useState(()=>readSharedMessages());
  const [profile,setProfile]=useState(()=>readProfile()||{days:23,cravingsOvercome:3,supporters:3});
  const [synced,setSynced]=useState(true);

  useEffect(()=>{
    if(!bc) return;
    const handler = (e) => {
      if(e.data.type==="messages") setMessages(e.data.data);
      if(e.data.type==="profile")  setProfile(e.data.data);
    };
    bc.addEventListener("message", handler);
    return ()=>bc.removeEventListener("message", handler);
  },[]);

  useEffect(()=>{
    const handler = (e) => {
      if(e.key===STORAGE_KEY_MSGS)    setMessages(JSON.parse(e.newValue||"[]"));
      if(e.key===STORAGE_KEY_PROFILE) setProfile(JSON.parse(e.newValue||"null")||profile);
    };
    window.addEventListener("storage", handler);
    return ()=>window.removeEventListener("storage", handler);
  },[]);

  function publishProfile(p){ setProfile(p); writeProfile(p); }

  function sendMessage(msg){
    const next = [...readSharedMessages(), msg];
    setMessages(next);
    writeSharedMessages(next);
  }

  function clearMessages(){ setMessages([]); writeSharedMessages([]); }

  return (
    <div style={{background:"var(--bg)",minHeight:"100vh",maxWidth:430,margin:"0 auto",position:"relative"}}>
      <style>{CSS}</style>
      <Orbs/>
      <SyncBadge synced={synced}/>
      {!role&&<RoleSelect onSelect={setRole}/>}
      {role==="tracker"&&(
        <TrackerApp
          onBack={()=>setRole(null)}
          messages={messages}
          onPublishProfile={publishProfile}
          onClearMessages={clearMessages}
        />
      )}
      {role==="supporter"&&(
        <SupporterPortal
          onBack={()=>setRole(null)}
          onSend={sendMessage}
          stats={profile}
        />
      )}
    </div>
  );
}
