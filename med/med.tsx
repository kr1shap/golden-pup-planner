// import React, { useState, useEffect } from 'react';

// const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

// const App = () => {
//     const [duration, setDuration] = useState(10);
//     const [timeRemaining, setTimeRemaining] = useState(0);
//     const [timerState, setTimerState] = useState('idle');
//     const [sessionHistory, setSessionHistory] = useState([]);
    
//     const [showFinishModal, setShowFinishModal] = useState(false);
//     const [showStopModal, setShowStopModal] = useState(false);

//     // Timer countdown effect
//     useEffect(() => {
//         if (timerState !== 'running' || timeRemaining <= 0) return;

//         const interval = setInterval(() => {
//             setTimeRemaining((prev) => {
//                 if (prev <= 1) {
//                     setTimerState('finished');
//                     setShowFinishModal(true);
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);

//         return () => clearInterval(interval);
//     }, [timerState, timeRemaining]);

//     const startTimer = () => {
//         if (timerState === 'idle') {
//             setTimeRemaining(duration * 60);
//         }
//         setTimerState('running');
//     };

//     const pauseTimer = () => {
//         if (timerState === 'running') {
//             setTimerState('paused');
//         }
//     };

//     const resetTimer = () => {
//         setTimerState('idle');
//         setTimeRemaining(0);
//         setShowFinishModal(false);
//         setShowStopModal(false);
//     };

//     const logMeditation = (minutes) => {
//         const newSession = {
//             id: Date.now().toString(),
//             minutes: minutes,
//             timestamp: new Date(),
//         };
        
//         setSessionHistory((prevHistory) => [newSession, ...prevHistory]);
//     };

//     const handleFinish = (didFinish) => {
//         if (didFinish) {
//             logMeditation(duration);
//         }
//         resetTimer();
//     };

//     const formatTime = (totalSeconds) => {
//         const minutes = Math.floor(totalSeconds / 60);
//         const seconds = totalSeconds % 60;
//         return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//     };

//     const calculateTotalMinutes = () => {
//         let total = 0;
//         for (let i = 0; i < sessionHistory.length; i++) {
//             total = total + sessionHistory[i].minutes;
//         }
//         return total;
//     };

//     const SetupView = () => (
//         <div className="space-y-6">
//             <h3 className="text-xl font-semibold text-gray-800 text-center">Set Duration (Minutes)</h3>
//             <div className="flex flex-wrap gap-3 justify-center">
//                 {DURATION_OPTIONS.map((min) => (
//                     <button
//                         key={min}
//                         onClick={() => setDuration(min)}
//                         className={`py-2 px-4 rounded-xl font-medium transition-colors duration-200 shadow-md ${
//                             duration === min
//                                 ? 'bg-blue-600 text-white shadow-blue-600/50 ring-4 ring-blue-600/30'
//                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                         }`}
//                     >
//                         {min} min
//                     </button>
//                 ))}
//             </div>
//             <button
//                 onClick={startTimer}
//                 className="w-full py-4 text-2xl font-bold bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition-colors duration-300"
//             >
//                 Start Meditation ({duration} min)
//             </button>
//         </div>
//     );

//     const TimerView = () => (
//         <div className="text-center space-y-8">
//             <div className={`text-9xl font-extrabold ${timerState === 'paused' ? 'text-orange-500' : 'text-gray-900'} transition-colors duration-500`}>
//                 {formatTime(timeRemaining)}
//             </div>
//             <div className="text-lg font-medium text-gray-600">
//                 {timerState === 'paused' ? 'Paused' : 'Focus!'}
//             </div>
//             <div className="flex gap-4 justify-center">
//                 <button
//                     onClick={timerState === 'running' ? pauseTimer : startTimer}
//                     className={`py-3 px-8 text-xl font-semibold rounded-xl transition-all shadow-md focus:outline-none focus:ring-4 w-40 ${
//                         timerState === 'running'
//                             ? 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500/50'
//                             : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600/50'
//                     }`}
//                 >
//                     {timerState === 'running' ? 'Pause' : 'Resume'}
//                 </button>
//                 <button
//                     onClick={() => setShowStopModal(true)}
//                     className="py-3 px-8 text-xl font-semibold rounded-xl transition-all shadow-md bg-gray-300 text-gray-800 hover:bg-gray-400 w-40"
//                 >
//                     Stop
//                 </button>
//             </div>
//         </div>
//     );

//     const FinishModal = () => (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6">
//                 <h3 className="text-3xl font-bold text-green-600">🎉 Session Complete!</h3>
//                 <p className="text-lg text-gray-700">
//                     Did you successfully complete your full {duration} minute meditation?
//                 </p>
//                 <div className="flex gap-4">
//                     <button
//                         onClick={() => handleFinish(true)}
//                         className="w-full py-3 text-lg font-semibold rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg"
//                     >
//                         Yes, Log It
//                     </button>
//                     <button
//                         onClick={() => handleFinish(false)}
//                         className="w-full py-3 text-lg font-semibold rounded-xl bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors"
//                     >
//                         No, Thanks
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     const StopModal = () => (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6">
//                 <h3 className="text-2xl font-bold text-red-600">Stop Meditation?</h3>
//                 <p className="text-lg text-gray-700">
//                     Are you sure? Your progress won't be logged.
//                 </p>
//                 <div className="flex gap-4">
//                     <button
//                         onClick={resetTimer}
//                         className="w-full py-3 text-lg font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
//                     >
//                         Yes, Stop
//                     </button>
//                     <button
//                         onClick={() => setShowStopModal(false)}
//                         className="w-full py-3 text-lg font-semibold rounded-xl bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors"
//                     >
//                         Keep Going
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     const HistoryView = () => {
//         const totalMinutes = calculateTotalMinutes();

//         return (
//             <div className="mt-10 pt-6 border-t border-gray-200">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Meditation History</h2>
                
//                 <div className="bg-blue-50 p-4 rounded-xl mb-4 text-center">
//                     <p className="text-sm font-medium text-gray-700">Total Minutes This Session</p>
//                     <p className="text-3xl font-extrabold text-blue-600">{totalMinutes}</p>
//                 </div>

//                 {sessionHistory.length === 0 ? (
//                     <p className="text-gray-500 text-center py-4">No sessions yet. Start meditating!</p>
//                 ) : (
//                     <div className="space-y-2 max-h-64 overflow-y-auto">
//                         {sessionHistory.map((session) => (
//                             <div key={session.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
//                                 <span className="font-semibold text-gray-800">{session.minutes} min</span>
//                                 <span className="text-sm text-gray-500">
//                                     {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//                 <p className="mt-4 text-xs text-gray-400 text-center">
//                     Note: History is stored in memory for this session only
//                 </p>
//             </div>
//         );
//     };

//     return (
//         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-4 sm:p-8">
//             <div className="max-w-xl mx-auto">
//                 <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">
//                     <span className="text-blue-600">Focus</span> Timer
//                 </h1>
//                 <p className="text-center text-gray-600 mb-8">
//                     Set your time and find your calm
//                 </p>

//                 <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
//                     {timerState === 'idle' && <SetupView />}
//                     {(timerState === 'running' || timerState === 'paused') && <TimerView />}
//                     {timerState === 'idle' && <HistoryView />}
//                 </div>

//                 {showFinishModal && <FinishModal />}
//                 {showStopModal && <StopModal />}
//             </div>
//         </div>
//     );
// };

// export default App;