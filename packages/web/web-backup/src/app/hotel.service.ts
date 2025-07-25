import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const GET_HOTELS = gql`
  query GetHotels($limit: Int, $offset: Int, $searchTerm: String) {
    hotels(limit: $limit, offset: $offset, searchTerm: $searchTerm) {
      id
      name
      location
      description
    }
    totalHotels(searchTerm: $searchTerm)
  }
`;

const CREATE_HOTEL = gql`
  mutation CreateHotel($name: String!, $location: String!, $description: String) {
    createHotel(name: $name, location: $location, description: $description) {
      id
      name
      location
      description
    }
  }
`;

const UPDATE_HOTEL = gql`
  mutation UpdateHotel($id: ID!, $name: String, $location: String, $description: String) {
    updateHotel(id: $id, name: $name, location: $location, description: $description) {
      id
      name
      location
      description
    }
  }
`;

const DELETE_HOTEL = gql`
  mutation DeleteHotel($id: ID!) {
    deleteHotel(id: $id) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class HotelService {

  constructor(private apollo: Apollo) { }

  getHotels(limit?: number, offset?: number, searchTerm?: string): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: GET_HOTELS,
      variables: {
        limit,
        offset,
        searchTerm,
      }
    }).valueChanges.pipe(map(result => result.data));
  }

  createHotel(name: string, location: string, description?: string): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_HOTEL,
      variables: {
        name,
        location,
        description
      },
      refetchQueries: [{ query: GET_HOTELS, variables: { searchTerm: '' } }]
    });
  }

  updateHotel(id: string, name?: string, location?: string, description?: string): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_HOTEL,
      variables: {
        id,
        name,
        location,
        description
      },
      refetchQueries: [{ query: GET_HOTELS, variables: { searchTerm: '' } }]
    });
  }

  deleteHotel(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_HOTEL,
      variables: {
        id
      },
      refetchQueries: [{ query: GET_HOTELS, variables: { searchTerm: '' } }]
    });
  }
}
