import { useEffect, useState } from 'react';
import { MyThoughtsContext, WaitingThoughtsContext } from './context';
import { THOUGHT_COLLECTION, auth, firestore, signIn } from './firebaseUtils';
import { orderBy, where, query, limit, onSnapshot, collection } from 'firebase/firestore';


const ThoughtKeeper = ({children}) => {
  const [waitingThoughts, setWaitingThoughts] = useState([]);
  const [myThoughts, setMyThoughts] = useState([]);
  
  useEffect(() => {
    const unsubscribes = [];
    const cleanUp = () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch (e) {
          console.log(e);
        }
      });
    };
          
    const f = async () => {
      await signIn();

      const myThoughtsUnsubscribe = onSnapshot(
        query(
          collection(firestore, THOUGHT_COLLECTION),
          where("owner", "==", auth.currentUser.uid),
          orderBy("updatedAt", "desc"),
        ),
        (snapshot) => {
          setMyThoughts(thoughts => {
            const output = Object.fromEntries(thoughts.map(t => [t.id, t]));
            
            const res = snapshot.docs.map(doc => output[doc.id] ? output[doc.id] :
                                          Object.assign({id: doc.id}, doc.data()))
            snapshot.docChanges().forEach(change => {
              if (change.type === 'modified') {
                res[change.newIndex] = Object.assign({id: change.doc.id}, change.doc.data());
              }
            });
            return res;
          });
        }
      );

      unsubscribes.push(myThoughtsUnsubscribe);
      
      const waitingThoughtsUnsubscribe = onSnapshot(
        query(
          collection(firestore, THOUGHT_COLLECTION),
          orderBy("numRespeaks", "asc"),
          orderBy("updatedAt", "desc"),
          limit(20)
        ),
        (snapshot) => {
          setWaitingThoughts(thoughts => {
            const sequence = thoughts.map(thought => thought.id);
            
            const currentThoughts = Object.fromEntries(
              thoughts.map(thought => [thought.id, thought]));
              
            const newThoughts = [];
            
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();
                if (process.env.NODE_ENV === 'production') {
                  if (data['owner'] === auth.currentUser.uid) {
                    return;
                  }
                }

                newThoughts.push(Object.assign({"id": change.doc.id},
                                               change.doc.data()));
              }
              if (change.type === 'modified') {
                const data = change.doc.data();
                if (process.env.NODE_ENV === 'production') {
                  if (data['owner'] === auth.currentUser.uid) {
                    return;
                  }
                }

                currentThoughts[change.doc.id] = Object.assign(
                  {"id": change.doc.id},
                  change.doc.data()
                );
              }
              if (change.type === 'delete') {
                if (currentThoughts[change.doc.id]) {
                  delete currentThoughts[change.doc.id];
                }
              }
            });

            while (newThoughts.length < 10 && sequence.length > 0) {
              const next = sequence.shift();
              if (currentThoughts[next]) {
                newThoughts.push(currentThoughts[next]);
              }
            }
            return newThoughts;
          });
        });
      
      unsubscribes.push(waitingThoughtsUnsubscribe);
    };
    f();
    
    return cleanUp();
  }, []);

  return (
    <MyThoughtsContext.Provider value={myThoughts}>
      <WaitingThoughtsContext.Provider value={waitingThoughts}>
        {children}
      </WaitingThoughtsContext.Provider>
    </MyThoughtsContext.Provider>
  );
}

export default ThoughtKeeper;
