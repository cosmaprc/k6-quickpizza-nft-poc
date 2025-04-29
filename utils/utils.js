export function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
// export default function fixedSeparation(separation=1, fn) {
//     return function(...args) {
//         const start = Date.now();
//         const result = fn.call(this, ...args);
//         const end = Date.now()
//         const secondsElapsed = Math.floor((end - start) / 1000);
//         console.log(`seconds elapsed = ${Math.floor(ms / 1000)}`);
//         if (secondsElapsed <= separation) {
//             sleep(secondsElapsed)
//         }
//         console.log(`Slept ${secondsElapsed} seconds`);
//         return result;
//       }
//     // descriptor.value = function (...args) {
//     //     const start = performance.now();
//     //     const result = originalMethod.apply(this, args);
//     //     const end = performance.now();
//     //     const secondsElapsed = Math.floor((end - start) / 1000);
//     //     console.log(`seconds elapsed = ${Math.floor(ms / 1000)}`);
//     //     if (secondsElapsed <= separation) {
//     //         sleep(secondsElapsed)
//     //     }
//     //     console.log(`Slept ${secondsElapsed} seconds`);
//     //     return result;
//     // };
//     // return descriptor;
// }

// // wrapper
// function logResult(fn) {
//     return function(...args) {
//       try {
//         const result = fn.call(this, ...args);
//         console.log(result);
//       } catch (e) {
//         console.error(result);
//         throw e;
//       }
//       return result;
//     }
//   }
