import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/authenticate';
import { favouritesAtom, searchHistoryAtom } from '@/store';

import { getFavourites, getHistory } from '@/lib/userData';

const PUBLIC_PATHS = ['/login', '/', '/_error', '/register'];

export default function RouteGuard(props){
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    const [favouritesList, setFavouritesList] = useAtom(favouritesAtom);
    const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom);

    async function updateAtoms(){
        setFavouritesList(await getFavourites());
        setSearchHistory(await getHistory());
    }

    useEffect(() => {
        updateAtoms();
        authCheck(router.pathname);

        const handleRouteChange = (url) => {
            const path = url.split('?')[0];
            authCheck(path);
        };

        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [authCheck, router.events, router.pathname, updateAtoms]);

    function authCheck(url){
        const path = url.split('?')[0];
        if(!isAuthenticated() && !PUBLIC_PATHS.includes(path)){
            setAuthorized(false);
            router.push('/login');
        }
        else{
            setAuthorized(true);
        }
    }

    return <>{authorized && props.children}</>;
}
