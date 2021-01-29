import {Subject, asyncScheduler, fromEvent } from 'rxjs';
import {scan, throttleTime} from 'rxjs/operators/';

const STARTSTOPWATCH = 'STARTSTOPWATCH';
const FINISHSTOPWATCH = 'FINISHSTOPWATCH';
const RESETSTOPWATCH = 'RESETSTOPWATCH';
const WAITINGSTOPWATCH = 'WAITINGSTOPWATCH';
const STEPSTOPWATCH = 'STEPSTOPWATCH';

const initialState = {
    isOn: false,
    setWaiting: false,
    time: 0,
};

function reducer (state = initialState, action) {
    switch(action.type){
        case 'STARTSTOPWATCH': {
            return {
                ...state,
                isOn: true,
                step: action.step,
                interval: action.interval
            }
        }
        case 'FINISHSTOPWATCH': {
            clearInterval(state.interval)
            return {
                ...state,
                time: 0,
                isOn: false
            }
        }
        case 'STEPSTOPWATCH': {
            return {
                ...state,
                time: state.time + (action.time - state.step),
                step: action.time
            }
        }
        case 'RESETSTOPWATCH': {
            return {
                ...state,
                time: 0
            }
        }
        case 'WAITINGSTOPWATCH': {
            clearInterval(state.interval)
            return {
                ...state,
                isOn: false
            }
        }
        default:
            return state;
    }
}

const startStopwatchAC = (step, interval) => ({type: STARTSTOPWATCH, step, interval})

const finishStopwatchAC = () => ({type: FINISHSTOPWATCH})

const resetStopwatchAC = () => ({type: RESETSTOPWATCH})

const waitingStopwatchAC = () => ({type: WAITINGSTOPWATCH})

const stepStopwatchAC = (time) => ({type: STEPSTOPWATCH, time})



const timeSpan = document.querySelector('#time');

function createStore (rootReducer) {
    const subj$ = new Subject();

    const store$ = subj$.pipe(
        scan(rootReducer, undefined)
    )

    store$.dispatch = (action) => subj$.next(action);

    return store$;
}

const store$ = createStore(reducer);

const timeFormat = (time) => {
    const splitTime = (time, length) => {

        while(time.length < length) {
            time = "0" + time;
        }
        return time;
    }

    time = new Date(time);
    time.setHours(0);

    let h = splitTime(time.getHours().toString(), 2);
    let m = splitTime(time.getMinutes().toString(), 2);
    let s = splitTime(time.getSeconds().toString(), 2);
    
    return `Time: ${h}:${m}:${s}`;
}

store$.subscribe( state => {
    timeSpan.innerHTML = timeFormat(state.time);
})


document.getElementById('startStopwatch').addEventListener('click', () => {
    console.log('111');
    const interval = setInterval( () => {
        store$.dispatch(stepStopwatchAC(Date.now()));
    });
    store$.dispatch(startStopwatchAC(Date.now(), interval));
})

document.getElementById('finishStopwatch').addEventListener('click', () => {
    store$.dispatch(finishStopwatchAC());
})


document.getElementById('resetStopwatch').addEventListener('click', () => {
    store$.dispatch(resetStopwatchAC());
})


let waitBtn = fromEvent(document.getElementById('waitingStopwatch'), 'dblclick');

const throttleConfig = {
    leading: false,
    trailing: true
  }

const waitBtnDoubleClick = waitBtn.pipe(
    throttleTime(300, asyncScheduler, throttleConfig)
)
 
waitBtnDoubleClick.subscribe(() => {
  store$.dispatch(waitingStopwatchAC())
});
