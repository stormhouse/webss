/**
 * Created by yazuo-frontend on 2016/6/1.
 */
function compute () {
    setTimeout(compute, 0)
    var now = new Date().getTime()
    console.log('start - ' + now/1000)
    while (now+1*1000 > new Date().getTime()) {}
    console.log('end   - ' + new Date().getTime()/1000)
    //compute()
}
compute()
