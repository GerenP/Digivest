export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Jangan menimpa palet bawaan `cyan` / `violet` dengan satu warna — itu menghapus semua shade (cyan-300, violet-600, dst.)
      colors: { ink:'#080b13', navy:'#0b1020', panel:'#101827', panel2:'#151f31', neon:'#f6d84a', muted:'#8996ad', brand:{ cyan:'#46d9f2', violet:'#7657ff' } },
      fontFamily: { sans:['DM Sans','sans-serif'], display:['Space Grotesk','sans-serif'] },
      boxShadow: { aura:'0 0 80px rgba(80,91,255,.16)' },
      keyframes: {
        rise:{'0%':{opacity:0,transform:'translateY(20px)'},'100%':{opacity:1,transform:'translateY(0)'}},
        pulseGlow:{'0%,100%':{boxShadow:'0 0 15px rgba(70,217,242,.12)'},'50%':{boxShadow:'0 0 35px rgba(118,87,255,.25)'}},
        orbit:{'0%':{transform:'rotate(0deg) translateX(7px) rotate(0deg)'},'100%':{transform:'rotate(360deg) translateX(7px) rotate(-360deg)'}}
      },
      animation:{rise:'rise .7s ease-out both',pulseGlow:'pulseGlow 4s ease-in-out infinite',orbit:'orbit 12s linear infinite'}
    }
  },
  plugins:[]
}
