import React, { useEffect, useState } from 'react';
import { getJSON, postJSON } from '../api';

function Home({ onOpenTeacher }) {
  const [token, setToken] = useState(localStorage.getItem('tg_token') || null);
  const [data, setData] = useState({ banners: [], topTeachers: [], cities: [] });
  const [city, setCity] = useState('');
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    // Telegram WebApp init
    if (window.Telegram && window.Telegram.WebApp) {
      const webapp = window.Telegram.WebApp;
      try {
        const initData = webapp.initData; // raw initData
        if (initData && !token) {
          postJSON('/auth/telegram', { initData }).then(r => {
            if (r.token) {
              setToken(r.token);
              localStorage.setItem('tg_token', r.token);
            }
          });
        }
        webapp.expand();
        webapp.onEvent('themeChanged', () => {});
      } catch (e) {
        console.warn('tg webapp init error', e);
      }
    }
  }, []);

  useEffect(() => {
    getJSON('/home').then(r => setData(r));
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [city]);

  function fetchTeachers() {
    const qs = city ? `?city=${encodeURIComponent(city)}` : '';
    getJSON(`/teachers${qs}`).then(r => setTeachers(r.items || []));
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>教师小程序</h2>
      <div>
        <h3>Banner</h3>
        {data.banners.map(b => <div key={b.id} style={{border:'1px solid #ddd', padding:8, marginBottom:8}}>{b.title}</div>)}
      </div>
      <div>
        <h3>置顶推荐</h3>
        <div style={{display:'flex', gap:8}}>
          {data.topTeachers.map(t => (
            <div key={t.id} style={{border:'1px solid #ddd', padding:8, width:150, cursor:'pointer'}} onClick={()=>onOpenTeacher(t.id)}>
              <div>{t.name}</div>
              <div>{t.level}</div>
              <div>{t.city}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3>按城市筛选</h3>
        <select value={city} onChange={(e)=>setCity(e.target.value)}>
          <option value=''>全部城市</option>
          {data.cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{marginTop:16}}>
        <h3>老师列表</h3>
        {teachers.map(t => (
          <div key={t.id} style={{border:'1px solid #eee', padding:8, marginBottom:8}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div>
                <div><strong>{t.name}</strong> <small>({t.level})</small></div>
                <div>{t.city}</div>
                <div>{t.bio}</div>
              </div>
              <div>
                <button onClick={()=>onOpenTeacher(t.id)}>查看</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{position:'fixed', right:16, bottom:16}}>
        <a href={'tg://resolve?domain=YOUR_SUPPORT_USERNAME'}>联系客服</a>
      </div>
    </div>
  );
}

export default Home;
