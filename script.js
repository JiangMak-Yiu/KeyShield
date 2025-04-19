// 配置参数
const config={  // #全局配置参数
  minLength:4,  // #最小密码长度
  maxLength:32, // #最大密码长度
  defaultLength:23, // #默认密码长度
  charset:{    // #字符集配置
    letters:'abcdefghijklmnopqrstuvwxyz', // #字母字符集
    numbers:'0123456789', // #数字字符集
    symbols:'!@#$%^&*()_+-=[]{}|;:,.<>?', // #符号字符集
    similar:'il1IoO0' // #相似字符
  },
  strengthLevels:[ // #强度等级配置
    {min:0,label:{zh:'弱',en:'Weak'},class:'weak',color:'#e74c3c'},    // #弱密码-红色
    {min:8,label:{zh:'中等',en:'Medium'},class:'medium',color:'#f39c12'}, // #中等密码-橙色
    {min:12,label:{zh:'强',en:'Strong'},class:'strong',color:'#2ecc71'},  // #强密码-浅绿色
    {min:16,label:{zh:'超级强',en:'Very Strong'},class:'very-strong',color:'#27ae60'} // #超级强-深绿色
  ],
  translations:{ // #翻译配置
    zh:{
      title:'密码生成器',
      passwordLength:'密码长度 (4-32)',
      options:'组合选项',
      letters:'字母',
      uppercase:'大小写',
      symbols:'标点符号',
      numbers:'数字',
      excludeSimilar:'排除相似字符',
      refreshTitle:'🔄 刷新密码',
      copyTitle:'📋 复制密码',
      copiedMessage:'✅ 已复制到剪贴板!',
      generateMessage:'🎉 密码已生成!'
    },
    en:{
      title:'Password Generator',
      passwordLength:'Password Length (4-32)',
      options:'Character Options',
      letters:'Letters',
      uppercase:'Uppercase',
      symbols:'Symbols',
      numbers:'Numbers',
      excludeSimilar:'Exclude Similar',
      refreshTitle:'🔄 Refresh Password',
      copyTitle:'📋 Copy Password',
      copiedMessage:'✅ Copied to clipboard!',
      generateMessage:'🎉 Password generated!'
    }
  }
};

// DOM元素
const elements={
  password:document.getElementById('password'),
  lengthSlider:document.getElementById('length-slider'),
  lengthValue:document.getElementById('length-value'),
  refreshBtn:document.getElementById('refresh'),
  copyBtn:document.getElementById('copy'),
  letters:document.getElementById('letters'),
  uppercase:document.getElementById('uppercase'),
  symbols:document.getElementById('symbols'),
  numbers:document.getElementById('numbers'),
  excludeSimilar:document.getElementById('exclude-similar'),
  strengthText:document.querySelector('.strength-text'),
  strengthIndicator:document.querySelector('.strength-indicator'),
  checkMark:document.querySelector('.check-mark'),
  passwordDisplay:document.querySelector('.password-display'),
  languageSelector:document.getElementById('language'),
  title:document.querySelector('h1'),
  lengthLabel:document.querySelector('.length-option label'),
  optionsTitle:document.querySelector('.character-options h3'),
  checkboxLabels:document.querySelectorAll('.checkbox-item label')
};

// 当前语言
let currentLanguage='zh';

// 显示通知消息
const showNotification=(message,type='success')=>{
  // 移除现有通知
  const existingNotification=document.querySelector('.notification');
  if(existingNotification)existingNotification.remove();
  
  // 创建通知元素
  const notification=document.createElement('div');
  notification.className=`notification ${type}`;
  notification.textContent=message;
  document.body.appendChild(notification);
  
  // 淡入动画
  setTimeout(()=>notification.classList.add('show'),10);
  
  // 自动消失
  setTimeout(()=>{
    notification.classList.remove('show');
    setTimeout(()=>notification.remove(),300);
  },2000);
};

// 生成随机密码
const generatePassword=()=>{
  let charset='',length=parseInt(elements.lengthSlider.value);
  
  // 根据选项构建字符集
  if(elements.letters.checked)charset+=config.charset.letters;
  if(elements.uppercase.checked)charset+=config.charset.letters.toUpperCase();
  if(elements.numbers.checked)charset+=config.charset.numbers;
  if(elements.symbols.checked)charset+=config.charset.symbols;
  
  // 排除相似字符
  if(elements.excludeSimilar.checked)
    charset=charset.split('').filter(c=>!config.charset.similar.includes(c)).join('');
  
  // 确保至少有一个字符类型被选中
  if(charset.length===0){
    elements.letters.checked=true;
    charset=config.charset.letters;
  }
  
  // 生成密码
  let password='';
  for(let i=0;i<length;i++)
    password+=charset.charAt(Math.floor(Math.random()*charset.length));
  
  // 添加生成动画效果
  const passwordEl=elements.password;
  passwordEl.style.opacity='0';
  
  setTimeout(()=>{
    // 更新UI
    passwordEl.textContent=password;
    passwordEl.style.opacity='1';
    updateStrengthIndicator(password);
    
    // 更新长度值颜色
    updateLengthValueColor();
    
    // 添加生成密码时的弹跳动画
    elements.passwordDisplay.classList.add('bounce');
    setTimeout(()=>elements.passwordDisplay.classList.remove('bounce'),500);
    
    // 显示生成成功消息
    const t=config.translations[currentLanguage];
    showNotification(t.generateMessage);
  },200);
};

// 更新强度指示器
const updateStrengthIndicator=password=>{
  const length=password.length;
  
  // 计算强度分数，仅基于长度
  let score=0;
  if(length>=8)score=1;  // 弱
  if(length>=16)score=2; // 中等
  if(length>=24)score=3; // 强
  if(length>=30)score=4; // 超级强
  
  // 设置强度等级
  const strengthLevel=config.strengthLevels[score>=4?3:(score>=3?2:(score>=2?1:0))];
  
  // 获取之前的强度类名（如果有）
  const prevClass=Array.from(elements.strengthIndicator.classList).find(
    cls=>['weak','medium','strong','very-strong'].includes(cls)
  );
  
  // 选择对应的表情符号
  let emoji;
  if(score === 0) emoji = '😱'; // 非常弱
  else if(score === 1) emoji = '😟'; // 弱
  else if(score === 2) emoji = '😐'; // 中等
  else if(score === 3) emoji = '😀'; // 强
  else emoji = '🔒'; // 超级强
  
  // 更新UI
  elements.strengthText.textContent=`${strengthLevel.label[currentLanguage]} ${emoji}`;
  
  // 设置强度颜色
  elements.strengthIndicator.style.borderLeft=`4px solid ${strengthLevel.color}`;
  elements.checkMark.style.background=`linear-gradient(145deg,${strengthLevel.color},${strengthLevel.color}dd)`;
  
  // 移除所有强度类名
  elements.strengthIndicator.classList.remove('weak','medium','strong','very-strong');
  // 添加当前强度类名
  elements.strengthIndicator.classList.add(strengthLevel.class);
  
  // 修改强度指示器背景，根据强度增加不同的颜色透明度
  const colorOpacity=0.1+(score/4)*0.2; // 根据得分(最高4分)计算透明度
  elements.strengthIndicator.style.backgroundColor=`rgba(${hexToRgb(strengthLevel.color)},${colorOpacity})`;
  
  // 添加过渡动画效果
  elements.strengthIndicator.classList.add('pulse');
  setTimeout(()=>elements.strengthIndicator.classList.remove('pulse'),500);
  
  // 如果强度等级发生变化，添加粒子动画效果
  if(prevClass && prevClass !== strengthLevel.class){
    createParticles(strengthLevel.color);
  }
};

// 创建粒子动画效果
const createParticles=color=>{
  // 创建粒子容器（如果不存在）
  let particlesContainer=document.querySelector('.particles-container');
  if(!particlesContainer){
    particlesContainer=document.createElement('div');
    particlesContainer.className='particles-container';
    elements.strengthIndicator.appendChild(particlesContainer);
  }
  
  // 清空现有粒子
  particlesContainer.innerHTML='';
  
  // 创建15个粒子
  for(let i=0;i<15;i++){
    const particle=document.createElement('span');
    particle.className='particle';
    particle.style.backgroundColor=color;
    particle.style.left=`${Math.random()*100}%`;
    particle.style.animationDelay=`${Math.random()*0.5}s`;
    particle.style.animationDuration=`${0.5+Math.random()*1}s`;
    particle.style.opacity=Math.random();
    particle.style.width=`${3+Math.random()*3}px`;
    particle.style.height=`${3+Math.random()*3}px`;
    
    particlesContainer.appendChild(particle);
  }
  
  // 一段时间后清除粒子
  setTimeout(()=>{
    if(particlesContainer){
      particlesContainer.innerHTML='';
    }
  },2000);
};

// 辅助函数：将十六进制颜色转换为RGB
const hexToRgb=hex=>{
  // 移除#号
  hex=hex.replace('#','');
  
  // 解析RGB值
  const r=parseInt(hex.substring(0,2),16);
  const g=parseInt(hex.substring(2,4),16);
  const b=parseInt(hex.substring(4,6),16);
  
  return `${r},${g},${b}`;
};

// 复制密码到剪贴板
const copyToClipboard=()=>{
  const password=elements.password.textContent;
  navigator.clipboard.writeText(password)
    .then(()=>{
      // 显示复制成功提示
      const originalText=elements.copyBtn.innerHTML;
      elements.copyBtn.innerHTML='<span class="icon">✅</span>';
      
      // 添加波纹效果
      const ripple=document.createElement('span');
      ripple.className='ripple';
      elements.copyBtn.appendChild(ripple);
      
      setTimeout(()=>{
        elements.copyBtn.innerHTML=originalText;
        ripple.remove();
      },1000);
      
      // 显示复制成功消息
      const t=config.translations[currentLanguage];
      showNotification(t.copiedMessage);
    })
    .catch(err=>console.error('复制失败:',err));
};

// 更新UI语言
const updateLanguage=lang=>{
  currentLanguage=lang;
  const t=config.translations[lang];
  
  // 动画语言图标
  const langIcon = document.querySelector('.language-icon');
  langIcon.classList.add('spin');
  setTimeout(() => {
    langIcon.classList.remove('spin');
  }, 1000);
  
  // 更新标题和标签
  elements.title.textContent=t.title;
  elements.lengthLabel.textContent=t.passwordLength;
  elements.optionsTitle.textContent=t.options;
  
  // 更新复选框标签
  const labelTexts=[t.letters,t.uppercase,t.symbols,t.numbers,t.excludeSimilar];
  elements.checkboxLabels.forEach((label,index)=>{
    label.textContent=labelTexts[index];
  });
  
  // 更新按钮提示
  elements.refreshBtn.title=t.refreshTitle;
  elements.copyBtn.title=t.copyTitle;
  
  // 更新密码强度指示器
  const password=elements.password.textContent;
  updateStrengthIndicator(password);
  
  // 更新文档语言
  document.documentElement.lang=lang;
  
  // 添加切换语言的动画
  document.body.classList.add('lang-transition');
  setTimeout(()=>document.body.classList.remove('lang-transition'),500);
};

// 事件监听器
const initEventListeners=()=>{
  // 密码长度滑块
  elements.lengthSlider.addEventListener('input',()=>{
    const newLength=elements.lengthSlider.value;
    elements.lengthValue.textContent=newLength;
    
    // 更新长度值的颜色
    updateLengthValueColor();
    
    // 添加值变化的动画效果
    elements.lengthValue.classList.add('pop');
    setTimeout(()=>elements.lengthValue.classList.remove('pop'),200);
    
    // 添加密码更新时的动画效果
    elements.passwordDisplay.classList.add('updating');
    
    // 实时更新密码 - 调整密码长度
    updatePasswordLength(newLength);
  });
  
  // 滑块释放时的处理
  elements.lengthSlider.addEventListener('mouseup',()=>{
    // 移除更新中的动画效果
    elements.passwordDisplay.classList.remove('updating');
    // 完成后执行弹性动画
    elements.passwordDisplay.classList.add('bounce');
    setTimeout(()=>elements.passwordDisplay.classList.remove('bounce'),500);
  });
  
  // 针对触摸设备
  elements.lengthSlider.addEventListener('touchend',()=>{
    // 移除更新中的动画效果
    elements.passwordDisplay.classList.remove('updating');
    // 完成后执行弹性动画
    elements.passwordDisplay.classList.add('bounce');
    setTimeout(()=>elements.passwordDisplay.classList.remove('bounce'),500);
  });
  
  // 刷新按钮
  elements.refreshBtn.addEventListener('click',()=>{
    // 添加旋转动画
    elements.refreshBtn.classList.add('rotate');
    setTimeout(()=>elements.refreshBtn.classList.remove('rotate'),500);
    generatePassword();
  });
  
  // 复制按钮
  elements.copyBtn.addEventListener('click',copyToClipboard);
  
  // 选项复选框
  const checkboxes=[
    elements.letters,
    elements.uppercase,
    elements.symbols,
    elements.numbers,
    elements.excludeSimilar
  ];
  
  checkboxes.forEach(checkbox=>{
    checkbox.addEventListener('change',()=>{
      // 添加选项变化时的过渡效果
      const label=checkbox.nextElementSibling;
      label.classList.add('highlight');
      setTimeout(()=>label.classList.remove('highlight'),300);
      generatePassword();
    });
  });
  
  // 语言选择器
  elements.languageSelector.addEventListener('change',function(){
    updateLanguage(this.value);
  });
  
  // 密码显示区域点击事件（双击复制）
  elements.passwordDisplay.addEventListener('dblclick',copyToClipboard);
};

// 实时更新密码长度
const updatePasswordLength=newLength=>{
  newLength=parseInt(newLength);
  const currentPassword=elements.password.textContent;
  let updatedPassword='';
  
  if(newLength > currentPassword.length){
    // 需要添加字符
    let charset='';
    if(elements.letters.checked)charset+=config.charset.letters;
    if(elements.uppercase.checked)charset+=config.charset.letters.toUpperCase();
    if(elements.numbers.checked)charset+=config.charset.numbers;
    if(elements.symbols.checked)charset+=config.charset.symbols;
    
    // 排除相似字符
    if(elements.excludeSimilar.checked)
      charset=charset.split('').filter(c=>!config.charset.similar.includes(c)).join('');
      
    // 确保至少有一个字符类型被选中
    if(charset.length===0){
      elements.letters.checked=true;
      charset=config.charset.letters;
    }
    
    // 添加新字符
    updatedPassword=currentPassword;
    for(let i=currentPassword.length;i<newLength;i++){
      updatedPassword+=charset.charAt(Math.floor(Math.random()*charset.length));
    }
  }else{
    // 截断密码
    updatedPassword=currentPassword.substring(0,newLength);
  }
  
  // 更新UI
  elements.password.textContent=updatedPassword;
  updateStrengthIndicator(updatedPassword);
};

// 更新长度值的颜色
const updateLengthValueColor=()=>{
  const length=parseInt(elements.lengthSlider.value);
  let color;
  
  if(length < 8){
    color='#e74c3c'; // 弱 - 红色
  }else if(length < 16){
    color='#e74c3c'; // 弱 - 红色
  }else if(length < 24){
    color='#f39c12'; // 中等 - 橙色
  }else if(length < 30){
    color='#2ecc71'; // 强 - 浅绿
  }else{
    color='#27ae60'; // 超级强 - 深绿
  }
  
  elements.lengthValue.style.background=`linear-gradient(135deg,${color},${color}dd)`;
};

// 创建CSS样式
const createStyles=()=>{
  const style=document.createElement('style');
  style.textContent=`
    .notification{
      position:fixed;
      bottom:-50px;
      left:50%;
      transform:translateX(-50%);
      background:rgba(46,204,113,0.9);
      color:white;
      padding:10px 20px;
      border-radius:5px;
      box-shadow:0 5px 15px rgba(0,0,0,0.2);
      z-index:1000;
      opacity:0;
      transition:all 0.3s ease;
    }
    .notification.show{
      bottom:20px;
      opacity:1;
    }
    .ripple{
      position:absolute;
      border-radius:50%;
      background:rgba(255,255,255,0.6);
      transform:scale(0);
      animation:ripple 0.6s linear;
      width:35px;
      height:35px;
    }
    @keyframes ripple{
      to{transform:scale(2);opacity:0;}
    }
    .pulse{
      animation:pulse 0.5s ease;
    }
    @keyframes pulse{
      0%{transform:scale(1);}
      50%{transform:scale(1.05);}
      100%{transform:scale(1);}
    }
    .pop{
      animation:pop 0.3s ease;
    }
    @keyframes pop{
      0%{transform:scale(1);}
      50%{transform:scale(1.2);}
      100%{transform:scale(1);}
    }
    .rotate{
      animation:rotate 0.5s ease;
    }
    @keyframes rotate{
      0%{transform:rotate(0);}
      100%{transform:rotate(360deg);}
    }
    .bounce{
      animation:bounce 0.5s ease;
    }
    @keyframes bounce{
      0%{transform:scale(1);}
      50%{transform:scale(1.02);}
      100%{transform:scale(1);}
    }
    .highlight{
      animation:highlight 0.3s ease;
    }
    @keyframes highlight{
      0%{color:white;}
      50%{color:#3498db;}
      100%{color:white;}
    }
    .lang-transition{
      animation:fade 0.5s ease;
    }
    @keyframes fade{
      0%{opacity:0.8;}
      100%{opacity:1;}
    }
  `;
  document.head.appendChild(style);
};

// 初始化应用
const init=()=>{
  // 创建自定义样式
  createStyles();
  
  // 设置初始密码长度
  elements.lengthSlider.value=config.defaultLength;
  elements.lengthValue.textContent=config.defaultLength;
  
  // 更新长度值的颜色
  updateLengthValueColor();
  
  // 初始化事件监听器
  initEventListeners();
  
  // 根据浏览器语言设置初始语言
  const browserLang=navigator.language.startsWith('zh')?'zh':'en';
  elements.languageSelector.value=browserLang;
  updateLanguage(browserLang);
  
  // 生成初始密码
  generatePassword();
};

// 启动应用
document.addEventListener('DOMContentLoaded',init); 