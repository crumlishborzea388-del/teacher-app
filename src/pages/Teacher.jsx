import React, { useEffect, useState } from 'react';
import { getJSON, postJSON } from '../api';

function Teacher({ id, back }) {
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const token = localStorage.getItem('tg_token');

  useEffect(() => {
    getJSON(`/teachers/${id}`).then(r => setData(r));
  }, [id]);

  async function submitFeedback() {
    const res = await postJSON(`/teachers/${id}/feedbacks`, { rating, text }, token);
    alert(res.success ? '已提交' : JSON.stringify(res));
    if (res.success) {
      getJSON(`/teachers/${id}`).then(r => setData(r));
      setText('');
      setRating(5);
    }
  }

  if (!data) return <div style={{padding:16}}>加载中...</div>;
  const { teacher, courses, feedbacks } = data;
  return (
    <div style={{padding:16}}>
      <button onClick={back}>返回</button>
      <h2>{teacher.name} <small>({teacher.level})</small></h2>
      <div>城市：{teacher.city}</div>
      <div>简介：{teacher.bio}</div>
      <h3>课程</h3>
      {courses.map(c=> <div key={c.id}>{c.title}</div>)}
      <h3>评价</h3>
      {feedbacks.map(f => <div key={f.id}><b>{f.rating}</b> {f.text}</div>)}
      <div style={{marginTop:16}}>
        <h4>我要评价</h4>
        <select value={rating} onChange={e=>setRating(Number(e.target.value))}>
          <option value={5}>5 分</option>
          <option value={4}>4 分</option>
          <option value={3}>3 分</option>
          <option value={2}>2 分</option>
          <option value={1}>1 分</option>
        </select>
        <br/>
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} style={{width:'100%'}}/>
        <button onClick={submitFeedback}>提交评价（需登录）</button>
      </div>
    </div>
  );
}

export default Teacher;
