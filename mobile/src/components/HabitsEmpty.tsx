import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";

interface HabitsEmptyProps {
    disabled : boolean
}

export function HabitsEmpty({disabled}: HabitsEmptyProps){
    const {navigate} = useNavigation()

    console.log('e ai?: ', disabled)

    function mensageEmpty(disabled: boolean){
        if(disabled){
            return 'Você ainda não está monitorando nenhum hábito '
        }
        return 'Você não adicionou nenhum hábito para ser monitorado nessa data, retorne e adicione em uma data atual.'
    }

    return (
        <Text className="text-zinc-400 text-base">
            {mensageEmpty(disabled)}
            {disabled && 
                <Text
                    className="text-violet-400 text-base underline active:text-violet-500"
                    onPress={() => navigate('new')}
                >
                    Comece cadastrando um.
                </Text>
            }
        </Text>
    )
}