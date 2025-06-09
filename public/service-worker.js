self.addEventListener('push', e => {
  const d = e.data.json();
  self.registration.showNotification(d.title,{
    body:d.body, icon:'/icons/icon-192.png', data:{url:d.url}
  });
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url=new URL(e.notification.data.url, location.origin).href;
  e.waitUntil(
    clients.matchAll({type:'window'}).then(list=>{
      for(const c of list) if(c.url===url) return c.focus();
      return clients.openWindow(url);
    })
  );
});
