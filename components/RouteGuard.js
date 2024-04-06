import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { isAuthenticated } from '@/lib/authenticate';
import { favouritesAtom, searchHistoryAtom } from '@/store';
import { getFavourites, getHistory } from '@/lib/userData';

const PUBLIC_PATHS = ['/login', '/', '/_error', '/register'];

export default function RouteGuard(props){
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    const [favouritesList, setFavouritesList] = useAtom(favouritesAtom);
    const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom);

    const updateAtoms = useCallback(async () => {
        setFavouritesList(await getFavourites());
        setSearchHistory(await getHistory());
    }, [setFavouritesList, setSearchHistory]);

    const authCheck = useCallback((url) => {
        const path = url.split('?')[0];
        if(!isAuthenticated() && !PUBLIC_PATHS.includes(path)){
            setAuthorized(false);
            router.push('/login');
        }
        else{
            setAuthorized(true);
        }
    }, [router]);

    useEffect(() => {
        const handleRouteChange = (url) => {
            const path = url.split('?')[0];
            authCheck(path);
        };

        updateAtoms();
        authCheck(router.pathname);

        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [authCheck, router, updateAtoms]);

    return <>{authorized && props.children}</>;
}
